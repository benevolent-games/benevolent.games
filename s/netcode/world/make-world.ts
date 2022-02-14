
import {randomId} from "./helpers/id.js"
import {freeze} from "./helpers/freeze.js"
import {Description, Delta, WorldEvent} from "./types.js"
import {applyDeltaToDescriptions} from "./helpers/apply-deltas-to-descriptions.js"

export function makeWorld() {
	const descriptions = new Map<string, Description>()
	const deltas = new Map<string, Delta>()
	const events = new Map<string, WorldEvent>()

	return {

		createDescription(...newDescriptions: Description[]): string[] {
			return newDescriptions.map(description => {
				const id = randomId()
				description.set(id, description)
				deltas.set(id, description)
				return id
			})
		},

		readDescription(...ids: string[]) {
			return ids.map(id => freeze({...descriptions.get(id)}))
		},

		updateDescription(...changes: [string, Delta][]) {
			for (const [id, delta] of changes) {
				applyDeltaToDescriptions(id, delta, descriptions)
				applyDeltaToDescriptions(id, delta, deltas)
			}
		},

		deleteDescription(...ids: string[]) {
			for (const id of ids) {
				descriptions.delete(id)
				deltas.delete(id)
			}
		},

		dispatchEvent(event: WorldEvent) {
			const id = randomId()
			events.set(id, event)
			return id
		},

		readAllDescriptions() {
			return [...descriptions.entries()]
				.map(([id, description]) => [id, freeze(description)])
		},

		extractAllChanges() {
			const deltaEntries = deltas.entries()
			const eventEntries = events.entries()
			deltas.clear()
			events.clear()
			return {
				deltaEntries,
				eventEntries,
			}
		},

		applyAllChanges({deltaEntries, eventEntries}: {
				deltaEntries: [string, Delta][]
				eventEntries: [string, WorldEvent][]
			}) {
			for (const [id, delta] of deltaEntries)
				applyDeltaToDescriptions(id, delta, descriptions)
			for (const [id, event] of eventEntries)
				events.set(id, event)
		},
	}
}
