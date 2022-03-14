
import {V3} from "./utils/v3.js"
import {makeKeyListener} from "./utils/key-listener.js"
import {makeMouseTracker} from "./utils/mouse-tracker.js"
import {AccessListeners, GetAccess, Quality, SpawnOptions, Thumbsticks} from "./types.js"

import {spawnCrate} from "./spawn/crate.js"
import {spawnCamera} from "./spawn/camera.js"
import {spawnPlayer} from "./spawn/player.js"
import {spawnCharacter} from "./spawn/character.js"
import {spawnDunebuggy} from "./spawn/dunebuggy.js"
import {spawnMapDesert} from "./spawn/map-desert.js"

export async function makeGame({
		playerId,
		quality,
		thumbsticks,
		getAccess,
		accessListeners,
		middle = [0, 0, 0],
	}: {
		playerId: string
		quality: Quality
		thumbsticks: Thumbsticks
		getAccess: GetAccess
		accessListeners: AccessListeners
		middle?: V3
	}) {

	const canvas = document.createElement("canvas")
	const engine = new BABYLON.Engine(canvas)
	const scene = new BABYLON.Scene(engine)

	await Ammo()
	const gravity = new BABYLON.Vector3(0, -9.81, 0)
	const physics = new BABYLON.AmmoJSPlugin(false)
	scene.enablePhysics(gravity, physics)

	BABYLON.SceneLoader.ShowLoadingScreen = false
	engine.loadingScreen = null

	const renderLoop = new Set<() => void>()
	engine.runRenderLoop(() => {
		for (const fun of renderLoop)
			fun()
		scene.render()
	})

	canvas.onclick = (event: any) => {
		const notTouch = event.pointerType !== undefined
			? event.pointerType !== "touch"
			: true
		if (notTouch && !document.pointerLockElement)
			canvas.requestPointerLock()
	}

	const options: SpawnOptions = {
		scene,
		engine,
		canvas,
		middle,
		quality,
		renderLoop,
		thumbsticks,
		mouseTracker: makeMouseTracker(),
		keyListener: makeKeyListener(),
		playerId,
		getAccess,
		accessListeners,
	}

	return {
		scene,
		engine,
		...options,
		resize: () => engine.resize(),
		get framerate() { return engine.getFps() },
		spawn: {
			camera: spawnCamera(options),
			crate: spawnCrate(options),
			player: spawnPlayer(options),
			character: spawnCharacter(options),
			mapDesert: spawnMapDesert(options),
			dunebuggy: spawnDunebuggy(options),
		}
	}
}
