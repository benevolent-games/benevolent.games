
export async function loadEnvironment(scene: BABYLON.Scene) {

	await BABYLON.SceneLoader.AppendAsync("/assets/", "environment.glb", scene, ({loaded, total}) => {
		const percent = (loaded / total) * 100
		console.log(`environment loading ${percent.toFixed(0)}%`)
	})

	console.log("done loading environment")

	const statics = scene.meshes.filter(mesh => mesh.name.startsWith("static_"))

	for (const mesh of statics) {
		mesh.isVisible = false
		mesh.setParent(null)
		mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
			mesh,
			BABYLON.PhysicsImpostor.MeshImpostor,
			{mass: 0, friction: 1, restitution: 0.1},
			scene,
		)
	}
}
