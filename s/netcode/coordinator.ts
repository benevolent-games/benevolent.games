
import {Await} from "dbmage"

import {Changes} from "./world/types.js"
import {makeWorld} from "./world/world.js"
import {makeGame} from "../game/make-game.js"
import {makeNetworking} from "./networking.js"
import {RemotePromise, remotePromise} from "./utils/remote-promise.js"
import {AnyEntityDescription, Entity, EntityDescription, Spawner} from "../game/types.js"

export function makeCoordinator({game, networking}: {
		game: Await<ReturnType<typeof makeGame>>
		networking: Await<ReturnType<typeof makeNetworking>>
	}) {

	const world = makeWorld<EntityDescription>()
	const entities = new Map<string, Entity>()
	const pendingEntitySpawns = new Set<string>()
	const pendingAddToWorld = new Map<string, RemotePromise<Entity>>()

	function hasEntityBeenAdded(id: string) {
		return entities.has(id) || pendingEntitySpawns.has(id)
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
						if (!networking.host)
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
				const {type} = description
				const spawner = <Spawner<EntityDescription>>game.spawn[type]
				if (spawner) {
					console.log(`adding entity "${type}"`)
					pendingEntitySpawns.add(id)
					spawner({
							host: networking.host,
							description: <any>description,
						})
						.then(entity => {
							entities.set(id, entity)
							pendingAddToWorld.get(id).resolve(entity)
							entity.update(world.readDescriptions(id)[0])
						})
						.catch(error => {
							pendingAddToWorld.get(id).reject(error)
						})
						.finally(() => {
							pendingEntitySpawns.delete(id)
							pendingAddToWorld.delete(id)
						})
				}
				else {
					console.error(`unknown entity type "${type}"`)
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
		[string, EntityDescription],
	]

	type ChangesUpdate = [
		UpdateType.Changes,
		Changes,
	]

	type Update = DescriptionUpdate | ChangesUpdate

	if (networking.host) {

		networkLoop.add(function describeEntities() {
			for (const [id, entity] of entities) {
				const description = entity.describe()
				world.assertDescription(id, description)
			}
		})

		let descriptionIndex = 0
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

	return {
		async addToWorld(...descriptions: AnyEntityDescription[]) {
			return Promise.all(descriptions.map(description => {
				const remote = remotePromise<Entity>()
				const [id] = world.createDescriptions(description)
				pendingAddToWorld.set(id, remote)
				return remote.promise
			}))
		},
		removeFromWorld(ids: string[]) {
			world.deleteDescriptions(...ids)
			for (const id of ids) {
				const entity = entities.get(id)
				entity.dispose()
				entities.delete(id)
			}
		}
	}
}
