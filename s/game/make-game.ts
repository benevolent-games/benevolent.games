
import {loadGlb} from "./utils/load-glb.js"

export async function makeGame() {
	const canvas = document.createElement("canvas")
	const engine = new BABYLON.Engine(canvas)
	const scene = new BABYLON.Scene(engine)

	await Ammo()
	const gravity = new BABYLON.Vector3(0, -9.81, 0)
	const physics = new BABYLON.AmmoJSPlugin()
	scene.enablePhysics(gravity, physics)

	BABYLON.SceneLoader.ShowLoadingScreen = false
	engine.loadingScreen = null

	engine.runRenderLoop(() => scene.render())
	canvas.onclick = () => canvas.requestPointerLock()

	;(<any>window).scene = scene

	return {
		canvas,
		resize: () => engine.resize(),
		spawn: {

			async player() {
				const mesh = BABYLON.Mesh.CreateCapsule(
					"player",
					{
						subdivisions: 2,
						tessellation: 16,
						capSubdivisions: 6,
						height: 1.75,
						radius: 0.25,
					},
					scene,
				)
				mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
					mesh,
					BABYLON.PhysicsImpostor.CapsuleImpostor,
					{
						mass: 75,
						friction: 1,
						restitution: 0,
					},
				)
				return {
					set position(pos: [number, number, number]) {
						mesh.position = new BABYLON.Vector3(...pos)
					},
					get position() {
						const {position: {x, y, z}} = mesh
						return [x, y, z]
					},
				}
			},

			async camera() {
				const cam = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
				cam.setTarget(BABYLON.Vector3.Zero())
				cam.attachControl(canvas, true)
				const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
				light.intensity = 0.7
			},

			async environment(path: string) {
				const assets = await loadGlb(scene, path)
				assets.addAllToScene()

				// hide instance base meshes

				const bases = new Set<BABYLON.AbstractMesh>()
				const instances = <BABYLON.InstancedMesh[]>assets.meshes.filter(
					mesh => mesh.isAnInstance
				)
				for (const instance of instances)
					bases.add(instance.sourceMesh)
				for (const mesh of bases)
					mesh.isVisible = false

				// setup physics impostors

				const statics = assets.meshes.filter(
					mesh =>
						mesh.name.toLowerCase().startsWith("static_") ||
						mesh.name.toLowerCase().endsWith(".static")
				)
				const staticBases = statics.filter(mesh => bases.has(mesh))
				const staticStandalones = statics.filter(mesh => !bases.has(mesh))
				const staticInstances = <BABYLON.InstancedMesh[]>statics.filter(mesh => mesh.isAnInstance)
				for (const mesh of [...staticBases, ...staticStandalones]) {
					mesh.setParent(null)
					mesh.isVisible = false
					mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
						mesh,
						BABYLON.PhysicsImpostor.MeshImpostor,
						{mass: 0, friction: 1, restitution: 0.1}
					)
				}
				for (const mesh of staticInstances) {
					mesh.physicsImpostor = mesh.sourceMesh.physicsImpostor
				}
			},
		},
	}
}
