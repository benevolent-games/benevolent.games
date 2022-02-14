
import {V2} from "../utils/v2.js"
import * as v3 from "../utils/v3.js"
import {walker} from "./player-tools/walker.js"
import {MemoIncoming} from "../../netcode/types.js"
import {makeCapsule} from "./player-tools/capsule.js"
import {setupLooking} from "./player-tools/looking.js"
import {makeReticule} from "./player-tools/reticule.js"
import {makePlayerCamera} from "./player-tools/player-camera.js"
import {asEntity, PlayerDescription, Spawner, SpawnOptions} from "../types.js"

export function spawnPlayer({
		scene, renderLoop, looker, keyListener, thumbsticks, playerId,
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

		const looking = setupLooking({
			looker,
			thumbsticks,
			thumbSensitivity: 0.04,
			mouseSensitivity: 1,
			capsule,
		})

		const walking = walker({
			walk: 5,
			sprint: 5 * 2,
			thumbsticks,
			keyListener,
			getLook: looking.getLook,
		})

		let currentWalkForce: V2 = [0, 0]

		if (isMe) {
			const camera = makePlayerCamera({scene, capsule: capsule, disposers})
			makeReticule({scene, camera, disposers})
			renderLoop.add(() => looking.applyLook(camera))

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
