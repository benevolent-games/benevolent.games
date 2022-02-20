
import * as v3 from "../../utils/v3.js"

export function makePlayerCameras({
		scene, capsule, disposers, headBone, fieldOfView, characterTransform,
	}: {
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
		disposers: Set<() => void>
		characterTransform: BABYLON.TransformNode
		headBone: BABYLON.Bone
		fieldOfView: number
	}) {

	const height = 0.75

	const headBoneTransform = new BABYLON.TransformNode("", scene)
	headBoneTransform.attachToBone(headBone, characterTransform)

	const headLocus = new BABYLON.TransformNode("", scene)
	headLocus.position = v3.toBabylon([0, height, 0])
	headLocus.parent = capsule

	const camera = new BABYLON.TargetCamera(
		"camera_firstPerson",
		BABYLON.Vector3.Zero(),
		scene,
	)
	camera.minZ = 0.3
	camera.maxZ = 20_000
	camera.parent = headBoneTransform
	camera.ignoreParentScaling = true
	camera.fov = fieldOfView
	disposers.add(() => camera.dispose())

	const rise = 0
	const distance = 1
	const thirdPersonCamera = new BABYLON.TargetCamera(
		"camera_thirdPerson",
		v3.toBabylon([0, rise, -distance]),
		scene,
	)
	thirdPersonCamera.minZ = 0.3
	thirdPersonCamera.maxZ = 20_000
	thirdPersonCamera.fov = fieldOfView
	thirdPersonCamera.parent = headLocus
	disposers.add(() => thirdPersonCamera.dispose())

	return {camera, thirdPersonCamera, headLocus}
}
