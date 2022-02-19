
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import {cap} from "../../utils/numpty.js"

export function playerLooking({mouseSensitivity, thumbSensitivity}: {
		mouseSensitivity: number
		thumbSensitivity: number
	}) {

	// radians
	let currentLook = v2.zero()

	function lookAdd(vector: V2) {
		const radian = Math.PI / 2
		currentLook = v2.add(currentLook, vector)
		currentLook[1] = cap(currentLook[1], -radian, radian)
	}

	return {
		get look() {
			return currentLook
		},
		addMouseforce(mouseforce: V2) {
			lookAdd(v2.multiplyBy(mouseforce, mouseSensitivity))
		},
		addThumbforce(thumbforce: V2) {
			lookAdd(v2.multiply(
				v2.multiplyBy(thumbforce, thumbSensitivity),
				<V2>[1, -1],
			))
		},
		applyPlayerLook(
				capsule: BABYLON.Mesh,
				camera: BABYLON.TargetCamera,
			) {
			const [x, y] = currentLook
			capsule.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
				x, 0, 0,
			)
			camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
				0, y, 0,
			)
		}
	}
}
