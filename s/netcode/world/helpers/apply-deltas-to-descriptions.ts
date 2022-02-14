
import {Delta, Description} from "../types.js"

export function applyDeltaToDescriptions<xDescription extends Description>(
		id: string,
		delta: Delta,
		descriptions: Map<string, xDescription>,
	) {

	const description: Description = descriptions.get(id)

	if (description) {
		for (const [key, value] of Object.entries(delta)) {
			if (value === undefined)
				delete description[key]
			else
				description[key] = value
		}
	}

	return <xDescription>description
}
