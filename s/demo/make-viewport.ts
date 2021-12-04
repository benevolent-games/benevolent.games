
export async function makeViewport() {
	const canvas = <HTMLCanvasElement>document.querySelector("canvas")
	const engine = new BABYLON.Engine(canvas)
	const scene = new BABYLON.Scene(engine)

	await Ammo()
	const gravity = new BABYLON.Vector3(0, -9.81, 0)
	const physics = new BABYLON.AmmoJSPlugin()
	scene.enablePhysics(gravity, physics)

	BABYLON.SceneLoader.ShowLoadingScreen = false
	engine.loadingScreen = null
	engine.runRenderLoop(() => scene.render())

	return {
		canvas,
		engine,
		scene,
		resize: () => engine.resize,
	}
}
