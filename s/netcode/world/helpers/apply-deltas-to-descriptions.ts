
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
		const {entity, ...changeableProperties} = delta
		for (const [key, value] of Object.entries(changeableProperties)) {
			if (value === undefined)
				delete description[key]
			else
				description[key] = value
		}
	}
}
