
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import {Thumbsticks} from "../../types.js"
import {makeKeyListener} from "../../utils/key-listener.js"

export function walker({
		walk, sprint, thumbsticks, keyListener, getLook,
	}: {
		walk: number
		sprint: number
		thumbsticks: Thumbsticks
		keyListener: ReturnType<typeof makeKeyListener>
		getLook: () => V2
	}) {

	function isPressed(key: string) {
		return keyListener.getKeyState(key).isDown
	}

	function directionalizeAndCap(strafe: number, stride: number) {
		const will = v2.rotate(
			...<v2.V2>[strafe, stride],
			-getLook()[1]
		)
		const magnitude = v2.magnitude(will)
		return (magnitude > 1)
			? v2.normalize(will)
			: will
	}

	function getKeyboardForce() {
		let stride = 0
		let strafe = 0
		if (isPressed("w")) stride += 1
		if (isPressed("s")) stride -= 1
		if (isPressed("a")) strafe -= 1
		if (isPressed("d")) strafe += 1
		const capped = directionalizeAndCap(strafe, stride)
		return v2.multiplyBy(
			capped,
			isPressed("shift")
				? sprint
				: walk,
		)
	}

	function getThumbForce() {
		let stride = 0
		let strafe = 0
		stride += thumbsticks.left.values[0]
		strafe += thumbsticks.left.values[1]
		const capped = directionalizeAndCap(strafe, stride)
		return v2.multiplyBy(capped, sprint)
	}

	function getForce() {
		const keyforce = getKeyboardForce()
		const thumbforce = getThumbForce()
		return v2.add(keyforce, thumbforce)
	}

	function capTopSpeed(force: V2) {
		const magnitude = v2.magnitude(force)
		return (magnitude > sprint)
			? v2.multiplyBy(v2.normalize(force), sprint)
			: force
	}

	return {
		getForce,
		capTopSpeed,
	}
}
