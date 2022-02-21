
import {V3} from "../utils/v3.js"
import {makeGame} from "../make-game.js"
import {AccessListeners, GetAccess, Thumbsticks} from "../types.js"
import {makeFramerateDisplay} from "../utils/make-framerate-display.js"
import {getGameQualityMode, startLoading, wirePointerLockAttribute, setupFullscreenToggling, enableDebugMeshPicking} from "./startup-routines.js"

export async function gameSetup({
		playerId, statsArea, thumbsticks,
		fullscreenButton, accessListeners, getAccess,
	}: {
		playerId: string
		statsArea: HTMLElement
		thumbsticks: Thumbsticks
		fullscreenButton: HTMLButtonElement
		getAccess: GetAccess
		accessListeners: AccessListeners
	}) {
	const quality = getGameQualityMode()
	const {finishLoading} = startLoading({quality})
	wirePointerLockAttribute(document.body, "data-pointer-lock")
	setupFullscreenToggling(
		"data-fullscreen",
		fullscreenButton,
	)

	const middle: V3 = [0, 0, 0]
	const game = await makeGame({
		quality,
		middle,
		thumbsticks,
		playerId,
		getAccess,
		accessListeners,
	})
	document.body.prepend(game.canvas)
	window.addEventListener("resize", game.resize)
	game.resize()
	window.scene = game.scene
	window.engine = game.engine

	statsArea.appendChild(
		makeFramerateDisplay({
			getFramerate: () => game.framerate,
		})
	)

	enableDebugMeshPicking({game})
	return {game, quality, middle, finishLoading}
}
