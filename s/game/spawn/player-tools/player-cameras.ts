
import * as v3 from "../../utils/v3.js"

export function makePlayerCameras({scene, capsule, disposers}: {
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
		disposers: Set<() => void>
	}) {

	const height = 0.75

	const camera = new BABYLON.TargetCamera(
		"camera_firstPerson",
		BABYLON.Vector3.Zero(),
		scene,
	)
	camera.minZ = 0.3
	camera.maxZ = 20_000
	camera.position = v3.toBabylon([0, height, 0])
	camera.parent = capsule
	disposers.add(() => camera.dispose())

	const distance = 3
	const thirdPersonCamera = new BABYLON.TargetCamera(
		"camera_thirdPerson",
		v3.toBabylon([0, height, -distance]),
		scene,
	)
	thirdPersonCamera.minZ = 0.3
	thirdPersonCamera.maxZ = 20_000
	thirdPersonCamera.parent = camera
	disposers.add(() => thirdPersonCamera.dispose())

	return {camera, thirdPersonCamera}
}
