
export async function makeViewport() {
	BABYLON.SceneLoader.ShowLoadingScreen = false

	const canvas = <HTMLCanvasElement>document.querySelector("canvas")
	const engine = new BABYLON.Engine(canvas)
	const scene = new BABYLON.Scene(engine)

	scene.collisionsEnabled = true

	await Ammo()
	const gravity = new BABYLON.Vector3(0, -9.81, 0)
	const physics = new BABYLON.AmmoJSPlugin()
	scene.enablePhysics(gravity, physics)

	engine.runRenderLoop(() => scene.render())
	engine.loadingScreen = null
	return {canvas, engine, scene}
}
