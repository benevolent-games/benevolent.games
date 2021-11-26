
import {Scene} from "@babylonjs/core/scene.js"
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader.js"

export async function loadEnvironment(scene: Scene) {

	await SceneLoader.AppendAsync("/assets/", "environment.glb", scene, ({loaded, total}) => {
		const percent = (loaded / total) * 100
		console.log(`environment loading ${percent.toFixed(0)}%`)
	})

	console.log("done loading environment")

	for (const mesh of scene.meshes) {
		if (mesh.id.startsWith("static"))
			mesh.isVisible = false
	}
}
