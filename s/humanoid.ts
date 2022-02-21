
import {getRando} from "dbmage"
import "./game/utils/thumbsticks/thumbsticks.js"

import {installXiome} from "./xiome.js"
// import {installXiomeMock} from "./xiome-mock.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

import {HostNetworking} from "./netcode/types.js"
import {CharacterType, PlayerDescription} from "./game/types.js"
import {gameSetup} from "./game/startup/game-setup.js"
import {makeNetworking} from "./netcode/networking.js"
import {makeCoordinator} from "./netcode/coordinator.js"

void async function main() {
	console.log("👼 benevolent.games", {BABYLON, Ammo})

	const xiome = await installXiome()
	const getAccess = () => xiome.models.accessModel.getAccess()
	const accessListeners = new Set<(access: AccessPayload) => void>()
	xiome.models.accessModel.track(() => {
		const access = getAccess()
		for (const listener of accessListeners)
			listener(access)
	})

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
			getAccess,
			accessListeners,
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
			{
				type: "player",
				position: [10, 5, 0],
				playerId,
				character: CharacterType.Robot,
			},
			{type: "crate", position: [8, 5, 10]},
			{type: "crate", position: [10, 5, 10]},
			{type: "crate", position: [12, 5, 10]},
			{type: "dunebuggy", position: [0, -1, 0]},
		)
		coordinator.hostAccess.requestListeners.add((clientId, [type, request]) => {
			if (request.subject === "spawn-player") {
				coordinator.hostAccess.addToWorld({
					type: "player",
					position: [-0.5, 5, 0],
					playerId: clientId,
					character: CharacterType.Robot,
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

	const loadingTime = (Date.now() - (<any>window).loadingTimeStart)
	console.log(`⏱️ humanoid ${(loadingTime / 1000).toFixed(1)}s to gameplay`)
}()
