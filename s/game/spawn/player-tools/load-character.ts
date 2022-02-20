
import {V3} from "../../utils/v3.js"
import * as v3 from "../../utils/v3.js"
import {loadGlb} from "../../babylon/load-glb.js"

export async function loadCharacter({scene, capsule, path}: {
		path: string
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
	}) {

	const assets = await loadGlb(scene, path)

	assets.meshes
		.filter(m => m.name.includes("female") || m.name.includes("male"))
		.forEach(m => m.isVisible = false)

	for (const mesh of assets.meshes) {
		if (mesh.name.includes("female") || mesh.name.includes("male")) {
			mesh.isVisible = false
		}
		else {
			const material = <BABYLON.PBRMaterial>mesh.material
			if (material)
				material.ambientColor = new BABYLON.Color3(1, 1, 1)
		}
	}

	const robot = assets.meshes.find(m => m.name !== "robot")

	robot.scaling = v3.toBabylon([0.5, 0.5, 0.5])
	robot.rotateAround(
		v3.toBabylon(v3.zero()),
		v3.toBabylon([0, 1, 0]),
		Math.PI,
	)
	robot.parent = capsule

	const findAnimation = (name: string) =>
		assets.animationGroups.find(a => a.name === name)

	for (const group of assets.animationGroups) {
		group.stop()
	}

	const tpose = findAnimation("tpose")
	const walking = findAnimation("walking")

	walking.start(true)

	return robot
}
