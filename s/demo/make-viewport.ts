
import {Scene} from "@babylonjs/core/scene.js"
import {Engine} from "@babylonjs/core/Engines/engine.js"

export function makeViewport() {
	const canvas = <HTMLCanvasElement>document.querySelector("canvas")
	const engine = new Engine(canvas)
	const scene = new Scene(engine)
	engine.runRenderLoop(() => scene.render())
	engine.loadingScreen = null
	return {canvas, engine, scene}
}
