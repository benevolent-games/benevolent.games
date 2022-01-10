
console.log("👼 benevolent.games", {BABYLON, Ammo})

import {V3} from "./game/utils/v3.js"
import * as v3 from "./game/utils/v3.js"
import {makeGame} from "./game/make-game.js"
import {makeFramerateDisplay} from "./demo/make-framerate-display.js"

void async function() {

	const middle: V3 = [0, 0, 0]
	const game = await makeGame(middle)
	document.querySelector(".game body").prepend(game.canvas)
	window.addEventListener("resize", game.resize)
	game.resize()

	let {getCameraPosition} = await game.spawn.camera()
	await Promise.all([
		game.spawn.environment({getCameraPosition: () => getCameraPosition()}),
		game.spawn.character(),
	])
	const player = await game.spawn.player(v3.add(middle, [10, 5, 0]))
	await game.spawn.crate([10, 5, 10])
	await game.spawn.dunebuggy([0, 0, 0])

	game.keyListener.on("e", state => {
		if (state.isDown) {
			const {pickedMesh} = game.scene.pick(
				game.canvas.width / 2,
				game.canvas.height / 2,
			)
			;(<any>window).pick = pickedMesh
			console.log(pickedMesh.name, pickedMesh)
		}
	})

	getCameraPosition = player.getCameraPosition

	document.querySelector(".stats").appendChild(
		makeFramerateDisplay({
			getFramerate: () => game.framerate,
		})
	)
}()
