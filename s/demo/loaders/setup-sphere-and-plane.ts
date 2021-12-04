
export async function setupSphereAndPlane({scene}: {
		scene: BABYLON.Scene
	}) {

	const material = new BABYLON.GridMaterial("grid", scene)

	const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
	sphere.position.y = 2
	sphere.material = material

	const ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene)
	ground.material = material
}
