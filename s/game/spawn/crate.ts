
import {V3} from "../utils/v3.js"
import {SpawnOptions} from "../types.js"

export function spawnCrate({scene}: SpawnOptions) {
	return async function(position: V3) {
		const mesh = BABYLON.Mesh.CreateBox("crate", 1, scene)
		mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
			mesh,
			BABYLON.PhysicsImpostor.BoxImpostor,
			{
				mass: 1,
				friction: 1,
				restitution: 0.5,
			}
		)
		mesh.position = new BABYLON.Vector3(...position)
	}
}
