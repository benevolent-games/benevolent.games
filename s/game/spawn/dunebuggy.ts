
import {V3} from "../utils/v3.js"
import {SpawnOptions} from "../types.js"
import {loadGlb} from "../babylon/load-glb.js"

export function spawnCrate({scene}: SpawnOptions) {
	return async function(position: V3) {
		const assets = await loadGlb(scene, "/assets/models/dunebuggy/dunebuggy.poo.glb")
		assets.removeAllFromScene()
		assets.addAllToScene()
		// mesh.position = new BABYLON.Vector3(...position)
	}
}
