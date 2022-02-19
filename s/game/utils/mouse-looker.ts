
import {V2} from "./v2.js"
import {cap} from "./numpty.js"

export function makeMouseLooker() {
	const listeners = new Set<(vector: V2) => void>()
	const callListeners = (vector: V2) => {
		for (const listener of listeners)
			listener(vector)
	}

	let sensitivity = 1 / 1_000

	const radian = Math.PI / 2
	let horizontalRadians = 0
	let verticalRadians = 0

	function add(x: number, y: number) {
		horizontalRadians += x
		verticalRadians += y
		verticalRadians = cap(verticalRadians, -radian, radian)
	}

	window.addEventListener("mousemove", (event) => {
		const {movementX, movementY} = event
		if (document.pointerLockElement) {
			callListeners([movementX, movementY])
			const x = movementX * sensitivity
			const y = movementY * sensitivity
			add(x, y)
		}
	})

	return {
		listeners,
		add,
		get values() {
			return <V2>[horizontalRadians, verticalRadians]
		},
	}
}
