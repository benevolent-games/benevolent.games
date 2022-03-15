
import {getRando} from "dbmage"
import "./game/utils/thumbsticks/thumbsticks.js"

import {installXiome} from "./xiome.js"
// import {installXiomeMock} from "./xiome-mock.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

import {V3} from "./game/utils/v3.js"
import {HostNetworking} from "./netcode/types.js"
import {gameSetup} from "./game/startup/game-setup.js"
import {makeNetworking} from "./netcode/networking.js"
import {randomSeed} from "./game/utils/random-tools.js"
import {makeCoordinator} from "./netcode/coordinator.js"
import {CharacterType, PlayerDescription} from "./game/types.js"

const map: string = "dungeon"

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
		let spawnpoint: V3 = [0, 5, 0]

		if (map === "desert") {
			spawnpoint = [10, 5, 0]
			await coordinator.hostAccess.addToWorld(
				{type: "mapDesert"},
			)
			await coordinator.hostAccess.addToWorld(
				{
					type: "player",
					playerId,
					position: spawnpoint,
					character: CharacterType.Robot,
				},
			)
		}

		else if (map === "dungeon") {
			// spawnpoint = [0, 55, 0] // above
			spawnpoint = [0, 1, 0] // within
			await coordinator.hostAccess.addToWorld(
				{
					type: "mapDungeon",
					seed: randomSeed(),
					// seed: 465430,
					pathSize: 10,
					amountOfLittleTiles: 70,
				},
			)
			await coordinator.hostAccess.addToWorld(
				{
					type: "player",
					position: spawnpoint,
					playerId,
					character: CharacterType.Robot,
				},
			)
		}

		else {
			throw new Error(`unknown map "${map}"`)
		}

		coordinator.hostAccess.requestListeners.add((clientId, [type, request]) => {
			if (request.subject === "spawn-player") {
				coordinator.hostAccess.addToWorld({
					type: "player",
					position: spawnpoint,
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
