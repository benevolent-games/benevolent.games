
import * as v3 from "../utils/v3.js"
import {walker} from "./player-tools/walker.js"
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

		if (isMe) {
			const camera = makePlayerCamera({scene, capsule: capsule, disposers})
			makeReticule({scene, camera, disposers})
			const looking = setupLooking({
				looker,
				thumbsticks,
				thumbSensitivity: 0.04,
				mouseSensitivity: 1,
				camera,
				capsule,
			})
			renderLoop.add(() => looking.applyLook())
			if (host) {
				const walking = walker({
					walk: 5,
					sprint: 5 * 2,
					thumbsticks,
					keyListener,
					getLook: looking.getLook,
				})
				capsule.physicsImpostor.registerBeforePhysicsStep(impostor => {
					impostor.wakeUp()
					const [x, z] = walking.getForce()
					const velocity3d = impostor.getLinearVelocity()
					impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z))
				})
			}
		}

		setInterval(() => {
			sendMemo("HELLO THIS IS A MEMO!!!")
		}, 1000)

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
			receiveMemo({entityId, playerId, memo}) {
				console.log("MEMO RECIEVED!!", entityId, playerId, memo)
			},
		})
	}
}
