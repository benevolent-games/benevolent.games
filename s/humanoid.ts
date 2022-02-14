
import {getRando} from "dbmage"
import "./game/utils/thumbsticks/thumbsticks.js"

import {installXiome} from "./xiome.js"
import {gameSetup} from "./game/startup/game-setup.js"
import {makeNetworking} from "./netcode/networking.js"
import {makeCoordinator} from "./netcode/coordinator.js"
import {HostNetworking} from "./netcode/types.js"
import {PlayerDescription} from "./game/types.js"

void async function main() {
	console.log("👼 benevolent.games", {BABYLON, Ammo})

	const xiome = await installXiome()
	const getAccess = () => xiome.models.accessModel.getAccess()

	const networking = await makeNetworking({
		rando: await getRando(),
		networkingPanel: document.querySelector(".networking"),
		indicatorsDisplay: document.querySelector(".indicators"),
		debugPanel: document.querySelector(".debug"),
		scoreboard: document.querySelector(".scoreboard"),
		getAccess,
	})

	async function setupGame(playerId: string) {
		const {game, quality, finishLoading} = await gameSetup({
			playerId,
			statsArea: document.querySelector(".stats"),
			fullscreenButton: document.querySelector(".buttonbar .fullscreen"),
			thumbsticks: {
				left: document.querySelector("thumb-stick.left"),
				right: document.querySelector("thumb-stick.right"),
			}
		})

		console.log("💅 quality:", quality)
		await game.spawn.camera()

		finishLoading()
		return game
	}

	const {playerId} = networking
	const game = await setupGame(playerId)

	const coordinator = makeCoordinator({networking, game})
	if (coordinator.hostAccess) {
		await coordinator.hostAccess.addToWorld(
			{type: "environment"},
		)
		await coordinator.hostAccess.addToWorld(
			{type: "player", position: [10, 5, 0], playerId},
			{type: "crate", position: [8, 5, 10]},
			{type: "crate", position: [10, 5, 10]},
			{type: "crate", position: [12, 5, 10]},
		)
		coordinator.hostAccess.requestListeners.add((clientId, [type, request]) => {
			if (request.subject === "spawn-player") {
				coordinator.hostAccess.addToWorld({
					type: "player",
					position: [-0.5, 5, 0],
					playerId: clientId,
				})
			}
		})
		const hostNet = <HostNetworking>networking
		hostNet.handlersForDisconnectedClients.add(clientId => {
			const descriptions = coordinator.hostAccess.world.readAllDescriptions()
			const foundDescription = descriptions.find(([,description]) => {
				const player = <PlayerDescription>description
				return player.type === "player" && player.playerId === clientId
			})
			if (foundDescription) {
				const [id] = foundDescription
				coordinator.hostAccess.removeFromWorld(id)
			}
		})
	}
	else {
		// client should ask to spawn a player for themselves
		coordinator.clientAccess.sendRequest({
			subject: "spawn-player",
		})
	}
}()
