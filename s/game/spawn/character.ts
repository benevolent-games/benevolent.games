
import {SpawnOptions} from "../types.js"
import {loadGlb} from "../babylon/load-glb.js"

export function spawnCharacter({scene}: SpawnOptions) {
	return async function() {
		const assets = await loadGlb(scene, "/assets/art/character/android14.glb")
		assets.removeAllFromScene()
		assets.addAllToScene()

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
}
