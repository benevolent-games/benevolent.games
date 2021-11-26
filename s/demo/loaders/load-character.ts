
import {Scene} from "@babylonjs/core/scene.js"
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader.js"

export async function loadCharacter(scene: Scene) {
	await SceneLoader.AppendAsync("/assets/", "character-03.glb", scene, () => {
		console.log("character loaded")
	})
}
