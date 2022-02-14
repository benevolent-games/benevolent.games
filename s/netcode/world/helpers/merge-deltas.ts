
import {Delta} from "../types.js"

export function mergeDeltas(
		id: string,
		delta: Delta,
		deltas: Map<string, Delta>,
	) {

	const oldDelta = deltas.get(id)

	if (oldDelta) {
		for (const [key, value] of Object.entries(delta))
			oldDelta[key] = value
	}
	else
		deltas.set(id, delta)
}
