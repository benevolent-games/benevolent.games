
import {randomId} from "sparrow-rtc"

import {freeze} from "./helpers/freeze.js"
import {mergeDeltas} from "./helpers/merge-deltas.js"
import {Description, Delta, WorldEvent, Changes} from "./types.js"
import {applyDeltaToDescriptions} from "./helpers/apply-deltas-to-descriptions.js"

export function makeWorld<xDescription extends Description>() {
	const descriptions = new Map<string, xDescription>()

	const additions = new Map<string, xDescription>()
	const removals = new Set<string>()
	const deltas = new Map<string, Delta<xDescription>>()
	const events = new Map<string, WorldEvent>()

	const descriptionListeners =
		new Set<(id: string, description: xDescription) => void>()

	const eventListeners =
		new Set<(id: string, event: WorldEvent) => void>()

	function callDescriptionListeners(id: string, description: xDescription) {
		for (const listener of descriptionListeners)
			listener(id, description)
	}

	function callEventListeners(id: string, event: WorldEvent) {
		for (const listener of eventListeners)
			listener(id, event)
	}

	return {
		descriptionListeners,

		createDescriptions(...newDescriptions: xDescription[]): string[] {
			return newDescriptions.map(description => {
				const id = randomId()
				descriptions.set(id, description)
				additions.set(id, description)
				callDescriptionListeners(id, description)
				return id
			})
		},

		readDescriptions(...ids: string[]) {
			return ids.map(id => freeze({...descriptions.get(id)}))
		},

		updateDescriptions(...updates: [string, Delta<xDescription>][]) {
			for (const [id, proposedDelta] of updates) {
				const oldDescription = descriptions.get(id)
				const delta: Delta = {}
				for (const [key, value] of Object.entries(proposedDelta)) {
					if (value !== oldDescription[key])
						delta[key] = value
				}
				applyDeltaToDescriptions(id, delta, descriptions)
				mergeDeltas(id, delta, deltas)
				callDescriptionListeners(id, descriptions.get(id))
			}
		},

		deleteDescriptions(...ids: string[]) {
			for (const id of ids) {
				descriptions.delete(id)
				removals.add(id)
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

		extractAllChanges(): Changes<xDescription> {
			const changes: Changes<xDescription> = {
				additions: [...additions],
				deltas: [...deltas],
				removals: [...removals],
				events: [...events],
			}
			deltas.clear()
			additions.clear()
			removals.clear()
			events.clear()
			return changes
		},

		applyAllChanges(changes: Changes<xDescription>) {
			const affectedDescriptions = new Map<string, xDescription>()

			for (const [id, description] of changes.additions) {
				descriptions.set(id, description)
				affectedDescriptions.set(id, description)
			}

			for (const id of changes.removals) {
				descriptions.delete(id)
				affectedDescriptions.set(id, undefined)
			}

			for (const [id, delta] of changes.deltas) {
				const description = applyDeltaToDescriptions(id, delta, descriptions)
				if (description)
					affectedDescriptions.set(id, description)
			}

			for (const [id, event] of changes.events)
				callEventListeners(id, event)
		},

		assertDescription(id: string, description: xDescription) {
			descriptions.set(id, description)
			callDescriptionListeners(id, description)
		}
	}
}
