
import {Scene} from "@babylonjs/core/scene.js"
import {Vector3} from "@babylonjs/core/Maths/math.js"
import {FreeCamera} from "@babylonjs/core/Cameras/freeCamera.js"
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight.js"

export async function setupCameraAndLights({scene, canvas}: {
		scene: Scene
		canvas: HTMLCanvasElement
	}) {
	const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene)
	camera.setTarget(Vector3.Zero())
	camera.attachControl(canvas, true)
	const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
	light.intensity = 0.7
}
