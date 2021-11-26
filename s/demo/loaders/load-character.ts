
import {Scene} from "@babylonjs/core/scene.js"
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader.js"

export async function loadCharacter(scene: Scene) {

	await SceneLoader.AppendAsync("/assets/", "character-04.glb", scene, () => {})
	console.log("character loaded")

	const man = scene.meshes.find(m => m.id.startsWith("man"))
	if (!man)
		throw new Error("man not found")

	let index = 0
	const animationGroups = scene.animationGroups

	setInterval(() => {
		scene.stopAllAnimations()
		const animationGroup = animationGroups[index]
		animationGroup.start(true)
		index += 1
		if (index >= animationGroups.length)
			index = 0
	}, 2 * 1000)
}
