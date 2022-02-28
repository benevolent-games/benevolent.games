
import * as v3 from "../utils/v3.js"
import * as quat from "../utils/quat.js"
import {asEntity, CrateDescription, Spawner, SpawnOptions} from "../types.js"
import {positionInterpolator, rotationInterpolator} from "../utils/interpolator.js"

const interpolationSteps = 3

export function spawnCrate({scene}: SpawnOptions): Spawner<CrateDescription> {
	return async function({host, description}) {

		const disposers = new Set<() => void>()

		const interpolators = {
			position: positionInterpolator(interpolationSteps),
			rotation: rotationInterpolator(interpolationSteps),
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
					mass: 50,
					friction: 1,
					restitution: 0.5,
				}
			)
			mesh.position = v3.toBabylon(description.position)
		}
		else {
			function physicsCallback() {
				mesh.position = v3.toBabylon(
					interpolators.position.getCloser(
						v3.fromBabylon(mesh.position)
					)
				)
				mesh.rotationQuaternion = quat.toBabylon(
					interpolators.rotation.getCloser(
						mesh.rotationQuaternion
							? quat.fromBabylon(mesh.rotationQuaternion)
							: quat.zero()
					)
				)
			}
			scene.onBeforePhysicsObservable.add(physicsCallback)
			disposers.add(() => scene.onBeforePhysicsObservable.removeCallback(physicsCallback))
		}

		return asEntity<CrateDescription>({
			update: description => {
				interpolators.position.updateGoalpost(description.position)
				if (description.rotation)
					interpolators.rotation.updateGoalpost(description.rotation)
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
