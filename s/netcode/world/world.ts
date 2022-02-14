
import {randomId} from "./helpers/id.js"
import {freeze} from "./helpers/freeze.js"
import {Description, Delta, WorldEvent, Changes} from "./types.js"
import {applyDeltaToDescriptions} from "./helpers/apply-deltas-to-descriptions.js"

export function makeWorld<xDescription extends Description>() {
	const descriptions = new Map<string, xDescription>()
	const deltas = new Map<string, Delta>()
	const events = new Map<string, WorldEvent>()

	const descriptionListeners =
		new Set<(id: string, description: xDescription) => void>()

	function callDescriptionListeners(id: string, description: xDescription) {
		for (const listener of descriptionListeners)
			listener(id, description)
	}

	return {
		descriptionListeners,

		createDescriptions(...newDescriptions: xDescription[]): string[] {
			return newDescriptions.map(description => {
				const id = randomId()
				descriptions.set(id, description)
				deltas.set(id, description)
				callDescriptionListeners(id, description)
				return id
			})
		},

		readDescriptions(...ids: string[]) {
			return ids.map(id => freeze({...descriptions.get(id)}))
		},

		updateDescriptions(...changes: [string, Delta][]) {
			for (const [id, delta] of changes) {
				applyDeltaToDescriptions(id, delta, descriptions)
				applyDeltaToDescriptions(id, delta, deltas)
				callDescriptionListeners(id, descriptions.get(id))
			}
		},

		deleteDescriptions(...ids: string[]) {
			for (const id of ids) {
				descriptions.delete(id)
				deltas.set(id, undefined)
				callDescriptionListeners(id, undefined)
			}
		},

		dispatchEvents(...newEvents: WorldEvent[]) {
			return newEvents.map(event => {
				const id = randomId()
				events.set(id, event)
				return id
			})
		},

		readAllDescriptions(): [string, xDescription][] {
			return [...descriptions.entries()]
				.map(([id, description]) => [id, freeze({...description})])
		},

		extractAllChanges(): Changes {
			const deltaEntries = [...deltas.entries()]
			const eventEntries = [...events.entries()]
			deltas.clear()
			events.clear()
			return {
				deltaEntries,
				eventEntries,
			}
		},

		applyAllChanges({deltaEntries, eventEntries}: Changes) {
			for (const [id, delta] of deltaEntries) {
				applyDeltaToDescriptions(id, delta, descriptions)
				callDescriptionListeners(id, descriptions.get(id))
			}
			for (const [id, event] of eventEntries)
				events.set(id, event)
		},

		assertDescription(id: string, description: xDescription) {
			descriptions.set(id, description)
			deltas.set(id, description)
			callDescriptionListeners(id, description)
		}
	}
}
