
console.log("💠 axiom", {BABYLON, Ammo})

import "./demo/setup-babylon-side-effects.js"
import {makeViewport} from "./demo/make-viewport.js"
import {makeCrate} from "./demo/loaders/make-crate.js"
import {loadCharacter} from "./demo/loaders/load-character.js"
import {loadEnvironment} from "./demo/loaders/load-environment.js"
import {makeFramerateDisplay} from "./demo/make-framerate-display.js"
import {setupCameraAndLights} from "./demo/loaders/setup-camera-and-lights.js"

void async function setupPlayground() {

	const viewport = await makeViewport()

	document.querySelector(".stats").appendChild(
		makeFramerateDisplay({
			getFramerate: () => viewport.engine.getFps(),
		})
	)

	await setupCameraAndLights(viewport)
	await loadCharacter(viewport.scene)
	await loadEnvironment(viewport.scene)

	makeCrate(viewport.scene)

	;(<any>window).scene = viewport.scene
}()
