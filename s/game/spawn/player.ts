
import {V2} from "../utils/v2.js"
import * as v2 from "../utils/v2.js"
import * as v3 from "../utils/v3.js"
import {walker} from "./player-tools/walker.js"
import {MemoIncoming} from "../../netcode/types.js"
import {makeCapsule} from "./player-tools/capsule.js"
import {makeReticule} from "./player-tools/reticule.js"
import {playerLooking} from "./player-tools/player-looking.js"
import {loadCharacter} from "./player-tools/load-character.js"
import {makePlayerCameras} from "./player-tools/player-cameras.js"
import {asEntity, PlayerDescription, Spawner, SpawnOptions} from "../types.js"

const walk = 5
const sprint = walk * 2
const mouseSensitivity = 1 / 1_000
const thumbSensitivity = 0.04

export function spawnPlayer({
		scene, renderLoop, mouseTracker, keyListener, thumbsticks, playerId,
	}: SpawnOptions): Spawner<PlayerDescription> {

	return async function({host, description, sendMemo}) {
		const disposers = new Set<() => void>()
		const isMe = description.playerId === playerId

		const capsule = makeCapsule({scene, disposers})
		capsule.position = v3.toBabylon(description.position)
		capsule.material.alpha = host ? 0.1 : 0.05

		const robot = await loadCharacter({
			scene,
			capsule,
			path: "/assets/art/temp/robot.glb",
			topSpeed: sprint,
		})

		if (host) {
			capsule.physicsImpostor = new BABYLON.PhysicsImpostor(
				capsule,
				BABYLON.PhysicsImpostor.CapsuleImpostor,
				{mass: 75, friction: 2, restitution: 0},
			)
			capsule.physicsImpostor.physicsBody.setAngularFactor(0)
		}

		const looking = playerLooking({
			mouseSensitivity,
			thumbSensitivity,
		})

		const walking = walker({
			walk,
			sprint,
			keyListener,
			thumbstick: thumbsticks.left,
		})

		// robot animations
		let rotation = v2.zero()
		let movement = v2.zero()

		if (isMe) {
			const {camera, thirdPersonCamera} = makePlayerCameras({
				scene,
				capsule,
				disposers,
			})
			scene.activeCamera = camera
			makeReticule({scene, camera: camera, disposers})

			mouseTracker.listeners.add(looking.addMouseforce)

			renderLoop.add(() => {
				const thumbforce = thumbsticks.right.values
				looking.addThumbforce(thumbforce)
				looking.applyPlayerLook(capsule, camera)
				rotation = looking.look
			})

			let thirdPerson = false
			function toggleThirdPerson(value = !thirdPerson) {
				thirdPerson = value
				scene.activeCamera = thirdPerson
					? thirdPersonCamera
					: camera
			}
			toggleThirdPerson(true)

			keyListener.on("p", state => {
				if (state.isDown)
					toggleThirdPerson()
			})

			const interval = setInterval(
				() => {
					sendMemo(["walk", walking.getForce()])
					sendMemo(["rotate", rotation])
				},
				33.333,
			)

			disposers.add(() => clearInterval(interval))
		}
		else {
			renderLoop.add(() => {
				capsule.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
					rotation[0], 0, 0,
				)
			})
		}

		renderLoop.add(() => {
			robot.animateWalking(movement)
			robot.animateVerticalLooking(rotation[1])
		})

		if (host) {
			capsule.physicsImpostor.registerBeforePhysicsStep(impostor => {
				impostor.wakeUp()
				const [x, z] = v2.rotate(movement, -rotation[0])
				const velocity3d = impostor.getLinearVelocity()
				impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z))
			})
		}

		return asEntity<PlayerDescription>({
			update(description) {
				capsule.position = v3.toBabylon(description.position)
				movement = description.movement ?? v2.zero()
				if (!isMe)
					rotation = description.rotation ?? v2.zero()
			},
			describe: () => ({
				type: "player",
				position: v3.fromBabylon(capsule.position),
				playerId: description.playerId,
				movement,
				rotation,
			}),
			dispose() {
				for (const disposer of disposers)
					disposer()
			},
			receiveMemo(incoming) {
				const [subject] = incoming.memo
				if (incoming.playerId !== description.playerId) {
					console.error(`memo for wrong player "${playerId}"`, incoming)
					return
				}

				if (subject === "walk") {
					const [,walkingForce] = incoming.memo
					movement = walking.capTopSpeed(walkingForce)
				}
				else if (subject === "rotate") {
					rotation = incoming.memo[1]
				}
				else
					console.error("unknown player memo", incoming)
			},
		})
	}
}
