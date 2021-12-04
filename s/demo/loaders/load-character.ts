
export async function loadCharacter(scene: BABYLON.Scene) {

	await BABYLON.SceneLoader.AppendAsync("/assets/", "character.glb", scene, () => {})
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
