
import * as v3 from "../utils/v3.js"
import * as quat from "../utils/quat.js"
import {asEntity, CrateDescription, Spawner, SpawnOptions} from "../types.js"

export function spawnCrate({scene}: SpawnOptions): Spawner<CrateDescription> {
	return async function({host}) {

		const mesh = BABYLON.MeshBuilder.CreateBox("crate", {size: 1}, scene)
		const material = new BABYLON.StandardMaterial("cratemat", scene)
		material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)
		mesh.material = material

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
		}
		else {
			material.alpha = 0.5
		}

		return asEntity<CrateDescription>({
			update: description => {
				mesh.position = v3.toBabylon(description.position)
				if (description.rotation)
					mesh.rotationQuaternion = quat.toBabylon(description.rotation)
			},
			describe: () => ({
				type: "crate",
				position: v3.fromBabylon(mesh.position),
				rotation: quat.fromBabylon(mesh.rotationQuaternion),
			}),
			dispose() {
				mesh.dispose()
			},
			receiveMemo() {},
		})
	}
}
