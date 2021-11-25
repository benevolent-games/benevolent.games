
import {Scene} from "@babylonjs/core/scene.js"
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader.js"

export async function loadEnvironment(scene: Scene) {
	await SceneLoader.AppendAsync("/assets/", "environment.glb", scene, () => {
		console.log("environment loaded")
	})
}
