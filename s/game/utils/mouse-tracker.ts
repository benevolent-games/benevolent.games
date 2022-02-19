
import {V2} from "./v2.js"

export function makeMouseTracker() {
	const listeners = new Set<(vector: V2) => void>()

	window.addEventListener("mousemove", (event) => {
		const {movementX, movementY} = event
		if (document.pointerLockElement)
			for (const listener of listeners)
				listener([movementX, movementY])
	})

	return {
		listeners,
	}
}
