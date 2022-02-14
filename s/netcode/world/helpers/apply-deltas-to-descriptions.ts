
import {Delta, Description} from "../types.js"

export function applyDeltaToDescriptions(
		id: string,
		delta: Delta,
		descriptions: Map<string, Description>,
	) {
	if (delta === undefined)
		descriptions.delete(id)
	else {
		const description = descriptions.get(id)
		if (description) {
			for (const [key, value] of Object.entries(delta)) {
				if (value === undefined)
					delete description[key]
				else
					description[key] = value
			}
		}
	}
}
