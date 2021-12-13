
console.log("💠 axiom", {BABYLON, Ammo})

// import {makeViewport} from "./demo/make-viewport.js"
// import {makeCrate} from "./demo/loaders/make-crate.js"
// import {loadCharacter} from "./demo/loaders/load-character.js"
// import {loadEnvironment} from "./demo/loaders/load-environment.js"
// import {makeFramerateDisplay} from "./demo/make-framerate-display.js"
// import {setupCameraAndLights} from "./demo/loaders/setup-camera-and-lights.js"
import {v3} from "./game/utils/v3.js"
import {makeGame} from "./game/make-game.js"
import {makeFramerateDisplay} from "./demo/make-framerate-display.js"

void async function setupPlay() {

	const game = await makeGame([0, 0, 0])
	document.querySelector(".game").prepend(game.canvas)
	window.addEventListener("resize", game.resize)
	game.resize()

	const {middle} = await game.spawn.environment("/assets/environment2.glb")
	await game.spawn.player(v3.add(middle, [2, 0, 2]))
	await game.spawn.character("/assets/android14.glb")
	// await game.spawn.character("/assets/character.glb")

	document.querySelector(".stats").appendChild(
		makeFramerateDisplay({
			getFramerate: () => game.framerate,
		})
	)
}()
