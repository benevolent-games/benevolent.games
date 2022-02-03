
console.log("👼 benevolent.games", {BABYLON, Ammo})

import {V3} from "./game/utils/v3.js"
import {makeGame} from "./game/make-game.js"
import {makeFramerateDisplay} from "./demo/make-framerate-display.js"

import "./thumbtastic/thumbtastic.js"
import {ThumbStick} from "./thumbtastic/thumb-stick.js"
import {getGameQualityMode, startLoading, wirePointerLockAttribute, setupFullscreenToggling, setupHumanoidDemo, enableDebugMeshPicking} from "./startup/main-startup-routines.js"

declare global {
	interface Window {
		scene: BABYLON.Scene
		engine: BABYLON.Engine
		pick: BABYLON.AbstractMesh
	}
}

void async function main() {
	const quality = getGameQualityMode()
	const {finishLoading} = startLoading({quality})
	wirePointerLockAttribute(document.body, "data-pointer-lock")
	setupFullscreenToggling(
		"data-fullscreen",
		document.querySelector<HTMLButtonElement>(".buttonbar .fullscreen"),
	)

	const middle: V3 = [0, 0, 0]
	const game = await makeGame({
		quality,
		middle,
		thumbsticks: {
			left: document.querySelector<ThumbStick>("thumb-stick.left"),
			right: document.querySelector<ThumbStick>("thumb-stick.right"),
		},
	})
	document.querySelector(".game body").prepend(game.canvas)
	window.addEventListener("resize", game.resize)
	game.resize()
	window.scene = game.scene
	window.engine = game.engine

	await setupHumanoidDemo({middle, game})

	enableDebugMeshPicking({game})
	document.querySelector(".stats").appendChild(
		makeFramerateDisplay({
			getFramerate: () => game.framerate,
		})
	)

	finishLoading()
}()
