
export async function loadEnvironment(scene: BABYLON.Scene) {

	await BABYLON.SceneLoader.AppendAsync("/assets/", "environment.glb", scene, ({loaded, total}) => {
		const percent = (loaded / total) * 100
		console.log(`environment loading ${percent.toFixed(0)}%`)
	})

	console.log("done loading environment")

	const statics = scene.meshes.filter(mesh => mesh.name.startsWith("static_"))
	const floor = <BABYLON.Mesh>statics.find(mesh => mesh.name === "static_collisionmesh.004")

	for (const mesh of statics) {
		mesh.isVisible = false
		mesh.checkCollisions = true
		mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
			mesh,
			BABYLON.PhysicsImpostor.MeshImpostor,
			{mass: 0},
			scene,
		)
	}

	;(<any>window).statics = statics
	;(<any>window).floor = floor
}
