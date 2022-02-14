
import {Thumbsticks} from "../../types.js"
import {makeMouseLooker} from "../../utils/mouse-looker.js"

export function setupLooking({
		looker,
		camera,
		capsule,
		thumbsticks,
		thumbSensitivity,
		mouseSensitivity,
	}: {
		thumbSensitivity: number
		mouseSensitivity: number
		thumbsticks: Thumbsticks
		looker: ReturnType<typeof makeMouseLooker>
		capsule: BABYLON.Mesh
		camera: BABYLON.TargetCamera
	}) {

	const thumb = {
		x: 0,
		y: 0,
	}

	const combined = {
		x: 0,
		y: 0,
	}

	return {
		getLook() {
			return combined
		},
		applyLook() {

			// mouse look
			const mouse = looker.mouseLook
			mouse.x *= mouseSensitivity
			mouse.y *= mouseSensitivity

			// thumb look
			const thumbforce = thumbsticks.right.values
			thumb.x += thumbforce.x * thumbSensitivity
			thumb.y += -thumbforce.y * thumbSensitivity

			// combined look, mouse and thumbs
			combined.x = thumb.x + mouse.x
			combined.y = thumb.y + mouse.y

			capsule.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
				combined.x, 0, 0,
			)

			camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
				0, combined.y, 0,
			)
		},
	}
}
