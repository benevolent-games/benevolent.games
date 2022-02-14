
import {getRando} from "dbmage"

import {installXiome} from "./xiome.js"
import "./game/utils/thumbsticks/thumbsticks.js"
import {gameSetup} from "./game/startup/game-setup.js"
import {makeNetworking} from "./netcode/networking.js"
import {makeCoordinator} from "./netcode/coordinator.js"

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

	const playerId = networking.getPlayerId()
	const game = await setupGame(playerId)

	console.log("player id", playerId)

	const coordinator = makeCoordinator({networking, game})
	if (coordinator.host) {
		await coordinator.host.addToWorld(
			{type: "environment"},
		)
		await coordinator.host.addToWorld(
			{type: "player", position: [10, 5, 0], playerId},
			{type: "crate", position: [8, 5, 10]},
			{type: "crate", position: [10, 5, 10]},
			{type: "crate", position: [12, 5, 10]},
		)
	}
	else {
		// client should ask to spawn a player for themselves
	}
}()
