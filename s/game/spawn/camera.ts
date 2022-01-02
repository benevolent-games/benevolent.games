
import {V3} from "../utils/v3.js"
import {SpawnOptions} from "../types.js"

export function spawnCamera({middle, scene, canvas}: SpawnOptions) {
	return async function() {
		const campos = new BABYLON.Vector3(...middle)
		const camera = new BABYLON.FreeCamera("camera1", campos, scene)
		camera.attachControl(canvas, true)
		camera.minZ = 1
		camera.maxZ = 20_000
		scene.activeCamera = camera
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
