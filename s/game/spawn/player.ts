
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

import * as v2 from "../utils/v2.js"
import {V3} from "../utils/v3.js"
import * as v3 from "../utils/v3.js"
import {hslToRgb} from "../utils/hsl.js"
import {walker} from "./player-tools/walker.js"
import {makeCapsule} from "./player-tools/capsule.js"
import {makeReticule} from "./player-tools/reticule.js"
import {playerLooking} from "./player-tools/player-looking.js"
import {loadCharacter} from "./player-tools/load-character.js"
import {makePlayerCameras} from "./player-tools/player-cameras.js"
import {asEntity, PlayerDescription, Spawner, SpawnOptions} from "../types.js"

const walk = 3
const sprint = walk * 2
const mouseSensitivity = 1 / 1_000
const thumbSensitivity = 0.04
const fieldOfView = 1.2
const capsuleHeight = 1.65
const defaultColor: V3 = [0.2, 0.2, 0.2]
const interpolationSteps = 3

export function spawnPlayer({
		scene, renderLoop, mouseTracker, keyListener, thumbsticks, playerId,
		getAccess, accessListeners, engine,
	}: SpawnOptions): Spawner<PlayerDescription> {

	return async function({host, description, sendMemo}) {
		const disposers = new Set<() => void>()
		const isMe = description.playerId === playerId

		let color: V3 = description.color ?? defaultColor
		let characterType = description.character
		let positionGoalPost = description.position

		const capsule = makeCapsule({scene, capsuleHeight, disposers})
		capsule.position = v3.toBabylon(description.position)
		capsule.material.alpha = host ? 0.1 : 0.05
		// capsule.isVisible = false

		const character = await loadCharacter({
			scene,
			capsule,
			capsuleHeight,
			path: "/assets/art/character/robot.glb",
			topSpeed: sprint,
		})

		character.setCustomColors(color)

		if (isMe) {
			function handleNewAccess(access: AccessPayload) {
				let newColor: V3 = [...defaultColor]
				const avatar = access?.user?.profile?.avatar
				if (avatar?.type === "simple") {
					const hue = Math.ceil(avatar.value * 360)
					newColor = hslToRgb([hue, 1, 0.6])
				}
				sendMemo(["color", newColor])
			}
			accessListeners.add(handleNewAccess)
			disposers.add(() => accessListeners.delete(handleNewAccess))
			handleNewAccess(getAccess())
		}


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
			const {camera, thirdPersonCamera, headLocus} = makePlayerCameras({
				scene,
				capsule,
				disposers,
				fieldOfView,
				headBone: character.headBone,
				characterTransform: character.transform,
			})
			scene.activeCamera = camera
			makeReticule({scene, camera, disposers})

			mouseTracker.listeners.add(looking.addMouseforce)

			renderLoop.add(() => {
				const thumbforce = thumbsticks.right.values
				looking.addThumbforce(thumbforce)
				looking.applyPlayerLook(capsule, headLocus)
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

			let currentCharacter = 0
			const finalCharacter = 2
			function nextCharacter() {
				currentCharacter += 1
				if (currentCharacter > finalCharacter)
					currentCharacter = 0
			}
			keyListener.on("m", state => {
				if (state.isDown) {
					nextCharacter()
					sendMemo(["character", currentCharacter])
				}
			})

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
			character.animateWalking(movement)
			character.animateVerticalLooking(rotation[1])
		})

		if (host) {
			capsule.physicsImpostor.registerBeforePhysicsStep(impostor => {
				impostor.wakeUp()
				const [x, z] = v2.rotate(movement, -rotation[0])
				const velocity3d = impostor.getLinearVelocity()
				impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z))
			})
		}
		else {
			function physicsCallback() {
				const currentPosition = v3.fromBabylon(capsule.position)
				const difference = v3.subtract(positionGoalPost, currentPosition)
				const step = v3.divideBy(difference, interpolationSteps)
				const newPosition = v3.add(currentPosition, step)
				capsule.position = v3.toBabylon(newPosition)
			}
			scene.onBeforePhysicsObservable.add(physicsCallback)
			disposers.add(() => {
				scene.onBeforePhysicsObservable.removeCallback(physicsCallback)
			})
		}

		return asEntity<PlayerDescription>({
			update(description) {
				positionGoalPost = description.position
				movement = description.movement ?? v2.zero()
				if (!isMe)
					rotation = description.rotation ?? v2.zero()
				if (description.character !== characterType) {
					characterType = description.character
					character.setCharacter(characterType)
				}
				if (description.color && !v3.equal(description.color, color)) {
					color = description.color
					character.setCustomColors(color)
				}
			},
			describe: () => ({
				type: "player",
				position: v3.fromBabylon(capsule.position),
				playerId: description.playerId,
				character: characterType,
				movement,
				rotation,
				color,
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
				else if (subject === "character") {
					characterType = incoming.memo[1]
					character.setCharacter(characterType)
				}
				else if (subject === "color") {
					color = incoming.memo[1]
					character.setCustomColors(color)
				}
				else
					console.error("unknown player memo", incoming)
			},
		})
	}
}
