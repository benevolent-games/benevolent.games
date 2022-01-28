
console.log("👼 benevolent.games", {BABYLON, Ammo})

import {V3} from "./game/utils/v3.js"
import * as v3 from "./game/utils/v3.js"
import {makeGame} from "./game/make-game.js"
import {Quality, Thumbsticks} from "./game/types.js"
import {makeFramerateDisplay} from "./demo/make-framerate-display.js"

import "./thumbtastic/thumbtastic.js"
import {ThumbStick} from "./thumbtastic/thumb-stick.js"

declare global {
	interface Window {
		scene: BABYLON.Scene
		engine: BABYLON.Engine
	}
}

void async function() {
	const thumbsticks: Thumbsticks = {
		left: document.querySelector<ThumbStick>("thumb-stick.left"),
		right: document.querySelector<ThumbStick>("thumb-stick.right"),
	}

	const quality: Quality = (
		localStorage.getItem("benevolent-high-quality") === "true"
			? "q0"
			: "q1"
	)

	const loadingSpan = document.querySelector<HTMLElement>(".loading span")
	if (quality === "q0")
		loadingSpan.textContent += " high quality"

	{ // pointer lock attribute on body
		document.addEventListener("pointerlockchange", () => {
			const isPointerLocked = !!document.pointerLockElement
			document.body.setAttribute(
				"data-pointer-lock",
				isPointerLocked
					? "true"
					: "false",
			)
		})
	}

	{ // fullscreen toggling
		const fullscreenButton = document.querySelector<HTMLButtonElement>(".buttonbar .fullscreen")
		if (document.fullscreenEnabled) {
			document.addEventListener("fullscreenchange", () => {
				const isFullscreen = !!document.fullscreenElement
				fullscreenButton.setAttribute("data-fullscreen", isFullscreen ? "true" : "false")
			})
			fullscreenButton.onclick = () => {
				const isFullscreen = !!document.fullscreenElement
				if (isFullscreen)
					document.exitFullscreen()
				else
					document.body.requestFullscreen()
			}
		}
		else {
			fullscreenButton.remove()
		}
	}

	const middle: V3 = [0, 0, 0]
	const game = await makeGame({quality, middle, thumbsticks})
	document.querySelector(".game body").prepend(game.canvas)
	window.addEventListener("resize", game.resize)
	game.resize()

	window.scene = game.scene
	window.engine = game.engine

	let {getCameraPosition} = await game.spawn.camera()
	await Promise.all([
		game.spawn.environment({getCameraPosition: () => getCameraPosition()}),
		game.spawn.character(),
	])
	const player = await game.spawn.player(v3.add(middle, [10, 5, 0]))
	await game.spawn.crate([10, 5, 10])
	await game.spawn.dunebuggy([0, 0, 0])

	await (async function finishLoading() {
		const loading = document.querySelector<HTMLElement>(".loading")
		loading.style.display = "none"
	}())

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
