
import {Scene} from "@babylonjs/core/scene.js"
import {Mesh} from "@babylonjs/core/Meshes/mesh.js"
import {GridMaterial} from "@babylonjs/materials/grid/gridMaterial.js"

export async function setupSphereAndPlane({scene}: {
		scene: Scene
	}) {

	const material = new GridMaterial("grid", scene)

	const sphere = Mesh.CreateSphere("sphere1", 16, 2, scene)
	sphere.position.y = 2
	sphere.material = material

	const ground = Mesh.CreateGround("ground1", 6, 6, 2, scene)
	ground.material = material
}
