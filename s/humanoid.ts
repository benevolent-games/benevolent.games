
import {getRando} from "dbmage"

import {installXiome} from "./xiome.js"
import * as v3 from "./game/utils/v3.js"
import "./game/utils/thumbsticks/thumbsticks.js"
import {gameSetup} from "./game/startup/game-setup.js"
import {makeNetworking} from "./netcode/networking.js"

void async function main() {
	console.log("👼 benevolent.games", {BABYLON, Ammo})

	const xiome = await installXiome()
	const getAccess = () => xiome.models.accessModel.getAccess()

	async function setupNetworking() {
		const rando = await getRando()
		await makeNetworking({
			rando,
			getAccess,
			networkingPanel: document.querySelector(".networking"),
			indicatorsDisplay: document.querySelector(".indicators"),
			debugPanel: document.querySelector(".debug"),
			scoreboard: document.querySelector(".scoreboard"),
		})
	}

	async function setupGame() {
		const {game, quality, middle, finishLoading} = await gameSetup({
			statsArea: document.querySelector(".stats"),
			fullscreenButton: document.querySelector(".buttonbar .fullscreen"),
			thumbsticks: {
				left: document.querySelector("thumb-stick.left"),
				right: document.querySelector("thumb-stick.right"),
			}
		})

		console.log("💅 quality:", quality)
	
		let {getCameraPosition} = await game.spawn.camera()

		await Promise.all([
			game.spawn.environment({getCameraPosition: () => getCameraPosition()}),
			// game.spawn.character(),
		])

		const player = await game.spawn.player(v3.add(middle, [10, 5, 0]))
		getCameraPosition = player.getCameraPosition

		await game.spawn.crate([10, 5, 10])
		// await game.spawn.dunebuggy([0, 0, 0])
		await game.spawn.corridor()

		finishLoading()
	}

	await Promise.all([
		setupNetworking(),
		setupGame(),
	])
}()
