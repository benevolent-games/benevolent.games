
export function makeReticule({scene, camera, disposers}: {
		scene: BABYLON.Scene
		disposers: Set<() => void>
		camera: BABYLON.TargetCamera
	}) {

	const box = BABYLON.MeshBuilder.CreateIcoSphere("box1", {radius: 0.003}, scene)
	box.position = new BABYLON.Vector3(0, 0, 1)
	box.parent = camera
	box.isPickable = false
	const boxMaterial = new BABYLON.StandardMaterial("box1-material", scene)
	boxMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1)
	boxMaterial.disableLighting = true
	box.material = boxMaterial
	disposers.add(() => boxMaterial.dispose())
	disposers.add(() => box.dispose())
}
