
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import {Thumbsticks} from "../../types.js"
import {makeKeyListener} from "../../utils/key-listener.js"
import {makeMouseLooker} from "../../utils/mouse-looker.js"

export function walker({
		walk, sprint, thumbsticks, keyListener, getLook,
	}: {
		walk: number
		sprint: number
		thumbsticks: Thumbsticks
		keyListener: ReturnType<typeof makeKeyListener>
		getLook: () => {x: number, y: number}
	}) {

	function isPressed(key: string) {
		return keyListener.getKeyState(key).isDown
	}

	function getKeyboardForce() {
		let stride = 0
		let strafe = 0
		if (isPressed("w")) stride += 1
		if (isPressed("s")) stride -= 1
		if (isPressed("a")) strafe -= 1
		if (isPressed("d")) strafe += 1
		const will = v2.rotate(
			...<v2.V2>[strafe, stride],
			-getLook().x
		)
		const magnitude = v2.magnitude(will)
		const capped = (magnitude > 1)
			? v2.normalize(will)
			: will
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
		stride += thumbsticks.left.values.y
		strafe += thumbsticks.left.values.x
		const will = v2.rotate(
			...<v2.V2>[strafe, stride],
			-getLook().x
		)
		const magnitude = v2.magnitude(will)
		const capped = (magnitude > 1)
			? v2.normalize(will)
			: will
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
