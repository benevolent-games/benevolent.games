
import {Quality} from "../types.js"
import {makeGame} from "../make-game.js"
import {Await} from "xiome/x/types/await.js"

export function getGameQualityMode(): Quality {
	return localStorage.getItem("benevolent-high-quality") === "true"
		? "q0"
		: "q1"
}

export function startLoading({quality}: {quality: Quality}) {
	const loadingSpan = document.querySelector<HTMLElement>(".loading span")
	if (quality === "q0")
		loadingSpan.textContent += " high quality"
	return {
		finishLoading() {
			const loading = document.querySelector<HTMLElement>(".loading")
			loading.style.display = "none"
		}
	}
}

export function wirePointerLockAttribute(element: HTMLElement, attributeName: string) {
	document.addEventListener("pointerlockchange", () => {
		const isPointerLocked = !!document.pointerLockElement
		element.setAttribute(
			attributeName,
			isPointerLocked
				? "true"
				: "false",
		)
	})
}

export function setupFullscreenToggling(attribute: string, fullscreenButton: HTMLElement) {
	if (document.fullscreenEnabled) {
		document.addEventListener("fullscreenchange", () => {
			const isFullscreen = !!document.fullscreenElement
			fullscreenButton.setAttribute(attribute, isFullscreen ? "true" : "false")
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

export function enableDebugMeshPicking({game}: {game: Await<ReturnType<typeof makeGame>>}) {
	game.keyListener.on("e", state => {
		if (state.isDown) {
			const {pickedMesh} = game.scene.pick(
				game.canvas.width / 2,
				game.canvas.height / 2,
			)
			window.pick = pickedMesh
			console.log(pickedMesh.name, pickedMesh)
		}
	})
}
