
import {V3} from "../utils/v3.js"
import * as v2 from "../utils/v2.js"
import {SpawnOptions} from "../types.js"

export function spawnPlayer({scene, renderLoop, looker, keyListener}: SpawnOptions) {
	return async function(position: V3) {
		const mesh = BABYLON.Mesh.CreateCapsule(
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
		mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
			mesh,
			BABYLON.PhysicsImpostor.CapsuleImpostor,
			{
				mass: 75,
				friction: 2,
				restitution: 0,
			},
		)
		mesh.position = new BABYLON.Vector3(...position)

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

		const box = BABYLON.MeshBuilder.CreateIcoSphere("box1", {radius: 0.003}, scene)
		box.position = new BABYLON.Vector3(0, 0, 1)
		box.parent = camera
		box.isPickable = false
		const boxMaterial = new BABYLON.StandardMaterial("box1-material", scene)
		boxMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1)
		boxMaterial.disableLighting = true
		box.material = boxMaterial

		renderLoop.add(() => {
			const {horizontalRadians, verticalRadians} = looker.mouseLook
			mesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
				horizontalRadians,
				0,
				0
			)
			camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
				0,
				verticalRadians,
				0
			)
		})

		{
			mesh.physicsImpostor.physicsBody.setAngularFactor(0)
			function isPressed(key: string) {
				return keyListener.getKeyState(key).isDown
			}
			// const topSpeed = 2
			const power = 10
			mesh.physicsImpostor.registerBeforePhysicsStep(impostor => {
				impostor.wakeUp()
				const willpower = isPressed("shift")
					? power * 2.5
					: power

				let stride = 0
				let strafe = 0
				if (isPressed("w")) stride += 1
				if (isPressed("s")) stride -= 1
				if (isPressed("a")) strafe -= 1
				if (isPressed("d")) strafe += 1

				const intention = v2.rotate(
					...v2.normalize([strafe, stride]),
					-looker.mouseLook.horizontalRadians
				)

				const force = v2.multiplyBy(
					intention,
					willpower,
				)

				const velocity3d = impostor.getLinearVelocity()
				// const velocity: V2 = [velocity3d.x, velocity3d.z]
				// const difference = v2.dot(forceDirection, velocity)
				// const distance = v2.distance(forceDirection, velocity)
				// const tanny = v2.atan2(intention, velocity)

				const [x, z] = force
				impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z))
			})
		}

		return {
			getCameraPosition(): V3 {
				return [
					camera.globalPosition.x,
					camera.globalPosition.y,
					camera.globalPosition.z,
				]
			},
		}
	}
}
