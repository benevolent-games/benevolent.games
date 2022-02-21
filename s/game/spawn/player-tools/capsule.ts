
export function makeCapsule({scene, capsuleHeight, disposers}: {
		scene: BABYLON.Scene
		capsuleHeight: number
		disposers: Set<() => void>
	}) {

	const capsule = BABYLON.MeshBuilder.CreateCapsule(
		"player",
		{
			subdivisions: 2,
			tessellation: 16,
			capSubdivisions: 6,
			height: capsuleHeight,
			radius: 0.25,
		},
		scene,
	)

	const material = new BABYLON.StandardMaterial("player", scene)
	material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7)
	material.ambientColor = new BABYLON.Color3(1, 1, 1)
	capsule.material = material

	disposers.add(() => capsule.material.dispose())
	disposers.add(() => capsule.dispose())

	return capsule
}
