
import * as v3 from "../../utils/v3.js"
import {V3} from "../../utils/v3.js"
import {loadGlb} from "../../babylon/load-glb.js"

export async function loadCharacter({scene, capsule, path}: {
		path: string
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
	}) {

	const assets = await loadGlb(scene, path)
	assets.removeAllFromScene()
	assets.addAllToScene()

	const mesh = assets.meshes.find(m => m.name !== "player")

	mesh.scaling = v3.toBabylon([0.5, 0.5, 0.5])
	mesh.rotateAround(
		v3.toBabylon(v3.zero()),
		v3.toBabylon([0, 1, 0]),
		Math.PI,
	)
	mesh.parent = capsule

	console.log(assets.animationGroups)
	const findAnimation = (name: string) =>
		assets.animationGroups.find(a => a.name === name)

	for (const group of assets.animationGroups) {
		group.stop()
	}

	const tpose = findAnimation("tpose")
	const walking = findAnimation("walking")

	walking.start(true)

	return mesh
}
