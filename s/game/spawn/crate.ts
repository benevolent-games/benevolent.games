
import * as v3 from "../utils/v3.js"
import {CrateDescription, Spawner, SpawnOptions} from "../types.js"

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

		return {
			update: description => {
				mesh.position = new BABYLON.Vector3(...description.position)
			},
			describe: () => ({
				type: "crate",
				position: v3.fromBabylon(mesh.position),
			}),
			dispose() {
				mesh.dispose()
			},
		}
	}
}
