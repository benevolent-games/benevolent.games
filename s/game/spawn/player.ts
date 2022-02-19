
import {V2} from "../utils/v2.js"
import * as v3 from "../utils/v3.js"
import {walker} from "./player-tools/walker.js"
import {MemoIncoming} from "../../netcode/types.js"
import {makeCapsule} from "./player-tools/capsule.js"
import {makeReticule} from "./player-tools/reticule.js"
import {playerLooking} from "./player-tools/player-looking.js"
import {makePlayerCameras} from "./player-tools/player-cameras.js"
import {asEntity, PlayerDescription, Spawner, SpawnOptions} from "../types.js"

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
		capsule.material.alpha = host ? 1 : 0.5

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
			walk: 5,
			sprint: 5 * 2,
			keyListener,
			thumbstick: thumbsticks.left,
			getLook: () => looking.look,
		})

		let currentWalkForce: V2 = [0, 0]

		if (isMe) {
			const {firstPersonCamera} = makePlayerCameras({
				scene,
				capsule,
				disposers
			})
			makeReticule({scene, camera: firstPersonCamera, disposers})

			mouseTracker.listeners.add(looking.addMouseforce)

			renderLoop.add(() => {
				const thumbforce = thumbsticks.right.values
				looking.addThumbforce(thumbforce)
				looking.applyPlayerLook(capsule, firstPersonCamera)
			})

			const interval = setInterval(
				() => sendMemo(["walk", walking.getForce()]),
				33.333,
			)

			disposers.add(() => clearInterval(interval))
		}

		if (host) {
			capsule.physicsImpostor.registerBeforePhysicsStep(impostor => {
				impostor.wakeUp()
				const [x, z] = currentWalkForce
				const velocity3d = impostor.getLinearVelocity()
				impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z))
			})
		}

		function handleWalkingMemo(incoming: MemoIncoming) {
			const [subject, walkingForce] = incoming.memo
			if (subject === "walk") {
				if (incoming.playerId === description.playerId)
					currentWalkForce = walking.capTopSpeed(walkingForce)
				else
					console.error(`walk memo for wrong player "${playerId}"`, incoming)
			}
			else
				console.error("unknown player memo", incoming)
		}

		return asEntity<PlayerDescription>({
			update(description) {
				capsule.position = v3.toBabylon(description.position)
			},
			describe: () => ({
				type: "player",
				position: v3.fromBabylon(capsule.position),
				playerId: description.playerId,
			}),
			dispose() {
				for (const disposer of disposers)
					disposer()
			},
			receiveMemo(incoming) {
				handleWalkingMemo(incoming)
			},
		})
	}
}
