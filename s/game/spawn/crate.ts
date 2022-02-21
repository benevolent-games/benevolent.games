
import * as v3 from "../utils/v3.js"
import * as quat from "../utils/quat.js"
import {asEntity, CrateDescription, Spawner, SpawnOptions} from "../types.js"

const interpolationSteps = 3

export function spawnCrate({scene}: SpawnOptions): Spawner<CrateDescription> {
	return async function({host, description}) {

		const disposers = new Set<() => void>()
		const goalposts = {
			position: description.position,
			rotation: description.rotation ?? quat.zero(),
		}

		const mesh = BABYLON.MeshBuilder.CreateBox("crate", {size: 1}, scene)
		const material = new BABYLON.StandardMaterial("cratemat", scene)
		material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)
		mesh.material = material
		disposers.add(() => mesh.dispose())

		if (host) {
			mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
				mesh,
				BABYLON.PhysicsImpostor.BoxImpostor,
				{
					mass: 1,
					friction: 1,
					restitution: 0.5,
				}
			)
			mesh.position = v3.toBabylon(description.position)
		}
		else {
			function physicsCallback() {
				const currentPosition = v3.fromBabylon(mesh.position)
				const difference = v3.subtract(goalposts.position, currentPosition)
				const step = v3.divideBy(difference, interpolationSteps)
				const newPosition = v3.add(currentPosition, step)
				mesh.position = v3.toBabylon(newPosition)

				{
					const goalRotation = quat.toBabylon(goalposts.rotation)
					const newRotation = BABYLON.Quaternion.Slerp(
						mesh.rotationQuaternion ?? BABYLON.Quaternion.Zero(),
						goalRotation,
						1 / interpolationSteps,
					)
					mesh.rotationQuaternion = newRotation
				}
			}
			scene.onBeforePhysicsObservable.add(physicsCallback)
			disposers.add(() => scene.onBeforePhysicsObservable.removeCallback(physicsCallback))
		}

		return asEntity<CrateDescription>({
			update: description => {
				goalposts.position = description.position
				if (description.rotation)
					goalposts.rotation = description.rotation
			},
			describe: () => ({
				type: "crate",
				position: v3.fromBabylon(mesh.position),
				rotation: quat.fromBabylon(mesh.rotationQuaternion),
			}),
			dispose() {
				for (const dispose of disposers)
					dispose()
			},
			receiveMemo() {},
		})
	}
}
