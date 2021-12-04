
export async function setupCameraAndLights({scene, canvas}: {
		scene: BABYLON.Scene
		canvas: HTMLCanvasElement
	}) {
	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
	camera.setTarget(BABYLON.Vector3.Zero())
	camera.attachControl(canvas, true)
	const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
	light.intensity = 0.7
}
