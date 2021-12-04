
export function makeCrate(scene: BABYLON.Scene) {

	const mesh = BABYLON.Mesh.CreateBox("crate", 1.0, scene)
	mesh.checkCollisions = true
	mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
		mesh,
		BABYLON.PhysicsImpostor.BoxImpostor,
		{mass: 1},
		scene,
	)
	mesh.position = new BABYLON.Vector3(-1, 0, 25)

	return {mesh}
}
