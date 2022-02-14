
import * as v3 from "../../utils/v3.js"

export function makePlayerCamera({scene, capsule, disposers}: {
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
		disposers: Set<() => void>
	}) {

	const camera = new BABYLON.TargetCamera(
		"camera",
		BABYLON.Vector3.Zero(),
		scene
	)
	camera.minZ = 0.3
	camera.maxZ = 20_000
	camera.position = v3.toBabylon([0, 0.75, 0])
	camera.parent = capsule
	scene.activeCamera = camera
	disposers.add(() => camera.dispose())
	return camera
}
