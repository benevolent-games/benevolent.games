
export function makeCrate(scene: BABYLON.Scene, position: [number, number, number]) {

	const mesh = BABYLON.Mesh.CreateBox("crate", 1, scene)
	mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
		mesh,
		BABYLON.PhysicsImpostor.BoxImpostor,
		{mass: 10, restitution: 0.1, friction: 0.5},
		scene,
	)
	mesh.position = new BABYLON.Vector3(...position)

	return {mesh}
}
