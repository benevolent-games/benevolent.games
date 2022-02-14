
import {V3} from "../utils/v3.js"
import * as v3 from "../utils/v3.js"
import {SpawnOptions} from "../types.js"
import {Description} from "../../netcode/world/types.js"

export interface CrateDescription extends Description {
	position: V3
}

export function spawnCrate({scene}: SpawnOptions) {
	return async function({host, description}: {
			host: boolean
			description: CrateDescription
		}) {

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

		function forceUpdate(description: CrateDescription) {
			mesh.position = new BABYLON.Vector3(...description.position)
		}

		function update(description: CrateDescription) {
			if (!host)
				forceUpdate(description)
		}

		forceUpdate(description)

		return {
			update,
			describe() {
				return {
					entityType: "crate",
					position: v3.fromBabylon(mesh.position),
				}
			},
			dispose() {
				mesh.dispose()
			},
		}
	}
}
