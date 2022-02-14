
import {Delta, Description} from "../types.js"

export function makeDelta<xDescription extends Description>({
		oldDescription,
		newDescription,
	}: {
		oldDescription: xDescription,
		newDescription: xDescription,
	}): Delta<xDescription> {

	const delta: Delta = {}

	for (const [key, value] of Object.entries(newDescription)) {
		if (value !== oldDescription[key])
			delta[key] = value
	}

	return <xDescription>delta
}
