
import {getRando} from "dbmage"

import {installXiome} from "./xiome.js"
import * as v3 from "./game/utils/v3.js"
import "./game/utils/thumbsticks/thumbsticks.js"
import {gameSetup} from "./game/startup/game-setup.js"
import {makeNetworking} from "./netcode/networking.js"
import {makeCoordinator} from "./netcode/coordinator.js"

void async function main() {
	console.log("👼 benevolent.games", {BABYLON, Ammo})

	const xiome = await installXiome()
	const getAccess = () => xiome.models.accessModel.getAccess()

	async function setupNetworking() {
		return makeNetworking({
			rando: await getRando(),
			networkingPanel: document.querySelector(".networking"),
			indicatorsDisplay: document.querySelector(".indicators"),
			debugPanel: document.querySelector(".debug"),
			scoreboard: document.querySelector(".scoreboard"),
			getAccess,
		})
	}

	async function setupGame() {
		const {game, quality, finishLoading} = await gameSetup({
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

	const [networking, game] = await Promise.all([
		setupNetworking(),
		setupGame(),
	])

	const coordinator = makeCoordinator({networking, game})
	if (networking.host) {
		await coordinator.addToWorld(
			{
				type: "environment",
			},
		)
		await coordinator.addToWorld(
			{
				type: "crate",
				position: [8, 5, 10],
			},
			{
				type: "crate",
				position: [10, 5, 10],
			},
			{
				type: "crate",
				position: [12, 5, 10],
			},
		)
	}

	await game.spawn.player(v3.add(game.middle, [10, 5, 0]))
	await game.spawn.dunebuggy([0, 0, 0])
}()
