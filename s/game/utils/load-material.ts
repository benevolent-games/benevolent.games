
export async function loadMaterial({
		scene, path, label,
	}: {
		path: string
		label: string
		scene: BABYLON.Scene
	}) {

	const material = new BABYLON.NodeMaterial(label, scene, {emitComments: false})
	material.setToDefault()

	await material.loadAsync(path)
		.then(() => material.build(false))

	return {
		material,
		assignTextures(textures: {[blockName: string]: string}) {
			const blocks = material.getTextureBlocks()
			for (const [blockName, texturePath] of Object.entries(textures)) {
				const block = blocks.find(b => b.name === blockName)
				if (!block)
					console.error(`cannot find texture block "${blockName}" for node material "${material.name}"`)
				block.texture = new BABYLON.Texture(texturePath, scene)
			}
			return material
		}
	}
}
