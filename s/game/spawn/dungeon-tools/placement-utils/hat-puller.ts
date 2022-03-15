
import {RandomTools} from "../../../utils/random-tools.js"

export function hatPuller<T>(randomTools: RandomTools, stuff: T[]) {
	const set = new Set<T>()

	function refill() {
		for (const item of stuff)
			set.add(item)
	}

	return {
		pull() {
			if (set.size === 0)
				refill()
			const item = randomTools.randomSelect([...set])
			set.delete(item)
			return item
		}
	}
}
