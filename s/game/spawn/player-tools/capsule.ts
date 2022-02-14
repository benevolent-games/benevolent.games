
export function makeCapsule({scene, disposers}: {
		scene: BABYLON.Scene
		disposers: Set<() => void>
	}) {

	const capsule = BABYLON.MeshBuilder.CreateCapsule(
		"player",
		{
			subdivisions: 2,
			tessellation: 16,
			capSubdivisions: 6,
			height: 1.75,
			radius: 0.25,
		},
		scene,
	)

	const material = new BABYLON.StandardMaterial("player", scene)
	material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7)
	capsule.material = material

	disposers.add(() => capsule.material.dispose())
	disposers.add(() => capsule.dispose())

	return capsule
}
