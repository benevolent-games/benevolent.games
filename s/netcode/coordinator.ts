
import {Await} from "dbmage"
import {makeGame} from "../game/make-game.js"
import {makeNetworking} from "./networking.js"
import {Changes, Description} from "./world/types.js"
import {makeWorld} from "./world/world.js"

export async function makeCoordinator({game, networking}: {
		game: Await<ReturnType<typeof makeGame>>
		networking: Await<ReturnType<typeof makeNetworking>>
	}) {

	const world = makeWorld()
	const entities = new Map()
	const pendingEntities = new Set<string>()

	function hasEntityBeenAdded(id: string) {
		return entities.has(id) || pendingEntities.has(id)
	}

	const networkLoop = new Set<() => void>()
	setInterval(() => {
		for (const loop of networkLoop)
			loop()
	}, 16.6667)

	const slowNetworkLoop = new Set<() => void>()
	setInterval(() => {
		for (const loop of slowNetworkLoop)
			loop()
	}, 100)

	networkLoop.add(function replicate() {
		for (const [id, description] of world.readAllDescriptions()) {
			if (hasEntityBeenAdded(id)) {
				const entity = entities.get(id)
				if (entity) {
					if (description) {
						entity.update(description)
					}
					else {
						console.log(`entity removed "${id}"`)
						entity.dispose()
						entities.delete(id)
					}
				}
			}
			else {
				const {entityType} = description
				if (entityType === "crate") {
					console.log(`adding entity "${entityType}"`)
					pendingEntities.add(id)
					game.spawn.crate({
							host: networking.host,
							description: <any>description,
						})
						.then(entity => entities.set(id, entity))
						.finally(() => pendingEntities.delete(id))
				}
				else {
					console.error(`unknown entity type "${entityType}"`)
				}
			}
		}
	})

	enum UpdateType {
		Description,
		Changes,
	}

	type DescriptionUpdate = [
		UpdateType.Description,
		[string, Description],
	]

	type ChangesUpdate = [
		UpdateType.Changes,
		Changes,
	]

	type Update = DescriptionUpdate | ChangesUpdate

	if (networking.host) {
		world.createDescription({
			entityType: "crate",
			position: [12, 5, 10]
		})
		world.createDescription({
			entityType: "crate",
			position: [14, 5, 10]
		})
		let descriptionIndex = 0
		networkLoop.add(function describeEntities() {
			for (const [id, entity] of entities) {
				const description = entity.describe()
				world.assertDescription(id, description)
			}
		})
		slowNetworkLoop.add(function broadcastDescriptions() {
			const allDescriptions = world.readAllDescriptions()
			if (descriptionIndex > allDescriptions.length - 1)
				descriptionIndex = 0
			const [id, description] = allDescriptions[descriptionIndex]
			networking.sendToAllClients(<DescriptionUpdate>[
				UpdateType.Description,
				[id, description],
			])
			descriptionIndex += 1
		})
		networkLoop.add(function broadcastAllChanges() {
			const changes = world.extractAllChanges()
			networking.sendToAllClients(<ChangesUpdate>[
				UpdateType.Changes,
				changes,
			])
		})
	}
	else {
		networking.receivers.add(([type, data]: Update) => {
			if (type === UpdateType.Description) {
				const [id, description] = <DescriptionUpdate[1]>data
				world.assertDescription(id, description)
			}
			else if (type === UpdateType.Changes) {
				const changes = <ChangesUpdate[1]>data
				world.applyAllChanges(changes)
			}
		})
	}
}
