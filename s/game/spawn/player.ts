
import {V2} from "../utils/v2.js"
import {V3} from "../utils/v3.js"
import * as v2 from "../utils/v2.js"
import * as v3 from "../utils/v3.js"
import {PlayerDescription, Spawner, SpawnOptions} from "../types.js"

export function spawnPlayer({
		scene, renderLoop, looker, keyListener, thumbsticks, playerId,
	}: SpawnOptions): Spawner<PlayerDescription> {
	return async function({host, description}) {

		const isMe = description.playerId === playerId
		const disposables = new Set<() => void>()

		const mesh = BABYLON.MeshBuilder.CreateCapsule(
			"player",
			{
				subdivisions: 2,
				tessellation: 16,
				capSubdivisions: 6,
				height: 1.75,
				radius: 0.25,
			},
			scene,
		)
		const material = new BABYLON.StandardMaterial("player", scene)
		material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7)
		if (!host)
			material.alpha = 0.5
		mesh.material = material
		disposables.add(() => mesh.material.dispose())
		disposables.add(() => mesh.dispose())

		mesh.position = v3.toBabylon(description.position)

		if (isMe) {
			console.log("PLAYER IS ME!!!!", playerId, description)
			const camera = new BABYLON.TargetCamera(
				"camera",
				BABYLON.Vector3.Zero(),
				scene
			)
			camera.minZ = 0.3
			camera.maxZ = 20_000
			camera.position = new BABYLON.Vector3(0, 0.75, 0)
			camera.parent = mesh
			scene.activeCamera = camera
			disposables.add(() => camera.dispose())

			const box = BABYLON.MeshBuilder.CreateIcoSphere("box1", {radius: 0.003}, scene)
			box.position = new BABYLON.Vector3(0, 0, 1)
			box.parent = camera
			box.isPickable = false
			const boxMaterial = new BABYLON.StandardMaterial("box1-material", scene)
			boxMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1)
			boxMaterial.disableLighting = true
			box.material = boxMaterial
			disposables.add(() => boxMaterial.dispose())
			disposables.add(() => box.dispose())

			renderLoop.add(() => {

				// add thumblook to mouselook values
				{
					const sensitivity = 0.02
					const {x, y} = thumbsticks.right.values
					looker.add(x * sensitivity, -y * sensitivity)
				}

				// apply mouselook as rotations
				const {horizontalRadians, verticalRadians} = looker.mouseLook
				mesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
					horizontalRadians, 0, 0,
				)
				camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
					0, verticalRadians, 0,
				)
			})
		}
		else {
			console.log("PLAYER IS NOT ME!!", playerId, description)
		}

		if (host) {
			mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
				mesh,
				BABYLON.PhysicsImpostor.CapsuleImpostor,
				{
					mass: 75,
					friction: 2,
					restitution: 0,
				},
			)
			mesh.physicsImpostor.physicsBody.setAngularFactor(0)
			if (isMe) {
				function isPressed(key: string) {
					return keyListener.getKeyState(key).isDown
				}
				// const topSpeed = 2
				const walk = 5
				const sprint = walk * 2.5
				mesh.physicsImpostor.registerBeforePhysicsStep(impostor => {
					impostor.wakeUp()

					let keyForce: V2
					let thumbForce: V2

					// keyboard
					{
						let stride = 0
						let strafe = 0
						if (isPressed("w")) stride += 1
						if (isPressed("s")) stride -= 1
						if (isPressed("a")) strafe -= 1
						if (isPressed("d")) strafe += 1
						const intention = v2.rotate(
							...<v2.V2>[strafe, stride],
							-looker.mouseLook.horizontalRadians
						)
						const magnitude = v2.magnitude(intention)
						const capped = (magnitude > 1)
							? v2.normalize(intention)
							: intention
						keyForce = v2.multiplyBy(
							capped,
							isPressed("shift")
								? sprint
								: walk,
						)
					}

					// thumbsticks
					{
						let stride = 0
						let strafe = 0
						stride += thumbsticks.left.values.y
						strafe += thumbsticks.left.values.x
						const intention = v2.rotate(
							...<v2.V2>[strafe, stride],
							-looker.mouseLook.horizontalRadians
						)
						const magnitude = v2.magnitude(intention)
						const capped = (magnitude > 1)
							? v2.normalize(intention)
							: intention
						thumbForce = v2.multiplyBy(capped, sprint)
					}

					const combinedForce = v2.add(keyForce, thumbForce)
					const magnitude = v2.magnitude(combinedForce)

					const force = (magnitude > sprint)
						? v2.multiplyBy(v2.normalize(combinedForce), sprint)
						: combinedForce

					const [x, z] = force
					const velocity3d = impostor.getLinearVelocity()
					impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z))
				})
			}
		}

		return {
			update(description) {
				mesh.position = v3.toBabylon(description.position)
			},
			describe: () => ({
				type: "player",
				position: v3.fromBabylon(mesh.position),
				playerId: description.playerId,
			}),
			dispose() {
				for (const disposable of disposables)
					disposable()
			},
		}
	}
}
