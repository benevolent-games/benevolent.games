
import * as v3 from "../../utils/v3.js"

export function makePlayerCameras({scene, capsule, disposers}: {
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
		disposers: Set<() => void>
	}) {

	const height = 0.75

	const firstPersonCamera = new BABYLON.TargetCamera(
		"camera_firstPerson",
		BABYLON.Vector3.Zero(),
		scene,
	)
	firstPersonCamera.minZ = 0.3
	firstPersonCamera.maxZ = 20_000
	firstPersonCamera.position = v3.toBabylon([0, height, 0])
	firstPersonCamera.parent = capsule
	scene.activeCamera = firstPersonCamera
	disposers.add(() => firstPersonCamera.dispose())

	// const distance = 3
	// const thirdPersonCamera = new BABYLON.TargetCamera(
	// 	"camera_thirdPerson",
	// 	v3.toBabylon([0, height, -distance]),
	// 	scene,
	// )
	// thirdPersonCamera.minZ = 0.3
	// thirdPersonCamera.maxZ = 20_000
	// // thirdPersonCamera.position = v3.toBabylon([0, height, -distance])
	// thirdPersonCamera.parent = firstPersonCamera
	// // scene.activeCamera = thirdPersonCamera
	// disposers.add(() => thirdPersonCamera.dispose())

	return {firstPersonCamera}
}
