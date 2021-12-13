
import {V3} from "./utils/v3.js"
import {loadGlb} from "./utils/load-glb.js"

export async function makeGame(middle: V3 = [0, 0, 0]) {
	const canvas = document.createElement("canvas")
	const engine = new BABYLON.Engine(canvas)
	const scene = new BABYLON.Scene(engine)

	await Ammo()
	const gravity = new BABYLON.Vector3(0, -9.81, 0)
	const physics = new BABYLON.AmmoJSPlugin()
	scene.enablePhysics(gravity, physics)

	BABYLON.SceneLoader.ShowLoadingScreen = false
	engine.loadingScreen = null

	const logic = new Set<() => void>()
	engine.runRenderLoop(() => {
		for (const fun of logic)
			fun()
		scene.render()
	})

	// canvas.onclick = () => canvas.requestPointerLock()

	;(<any>window).scene = scene

	const lpos = new BABYLON.Vector3(2000, 2000, -2000)
	const lvec = lpos.negate()

	const campos = new BABYLON.Vector3(...middle)
	const camera = new BABYLON.FreeCamera("camera1", campos, scene)
	camera.attachControl(canvas, true)
	camera.minZ = 1
	camera.maxZ = 20_000

	return {
		canvas,
		resize: () => engine.resize(),
		get framerate() { return engine.getFps() },
		spawn: {

			async player(position: V3) {
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
				mesh.position = new BABYLON.Vector3(...position)
			},

			async character(path: string) {
				const assets = await loadGlb(scene, path)
				assets.removeAllFromScene()
				assets.addAllToScene()

				let index = 0
				const animationGroups = scene.animationGroups

				setInterval(() => {
					scene.stopAllAnimations()
					const animationGroup = animationGroups[index]
					animationGroup.start(true)
					index += 1
					if (index >= animationGroups.length)
						index = 0
				}, 2 * 1000)
			},

			async environment(path: string) {
				const assets = await loadGlb(scene, path)
				assets.removeAllFromScene()
				assets.addAllToScene()

				const root = scene.rootNodes.find(node => node.name.includes("__root__"))

				const statics = assets.meshes.filter(
					mesh => {
						const name = mesh.name.toLowerCase()
						return (
							name.includes("static_") ||
							name.includes(".static")
						)
					}
				)

				for (const mesh of statics) {
					mesh.isVisible = false
					if (!mesh.isAnInstance) {
						mesh.setParent(null)
						mesh.isVisible = false
						mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
							mesh,
							BABYLON.PhysicsImpostor.MeshImpostor,
							{mass: 0, friction: 1, restitution: 0.1}
						)
					}
				}

				for (const mesh of statics) {
					if (mesh.isAnInstance) {
						const instance = <BABYLON.InstancedMesh>mesh
						instance.physicsImpostor = instance.sourceMesh.physicsImpostor
					}
				}

				for (const mesh of <BABYLON.Mesh[]>assets.meshes) {
					if (mesh.isAnInstance && scene.rootNodes.includes(mesh.parent)) {
						mesh.isVisible = false
					}
				}

				const skycolor = new BABYLON.Color3(0.5, 0.6, 1)
				scene.clearColor = new BABYLON.Color4(0.5, 0.75, 1, 1)
				scene.ambientColor = new BABYLON.Color3(0.5, 0.75, 1)
				scene.fogColor = new BABYLON.Color3(0.5, 0.6, 1)

				scene.fogMode = BABYLON.Scene.FOGMODE_EXP2
				scene.fogDensity = 0.00007

				const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 20_000 }, scene)
				const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene)
				skyboxMaterial.backFaceCulling = false
				skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/skybox2/sky", scene)
				skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
				skyboxMaterial.diffuseColor = skycolor
				skyboxMaterial.specularColor = skycolor
				skybox.material = skyboxMaterial
				skybox.infiniteDistance = true
				skyboxMaterial.disableLighting = true
				skybox.applyFog = false

				// torus.position = lpos
				
				const torus = BABYLON.Mesh.CreateTorus("torus", 100, 50, 10, scene)
				const sun = new BABYLON.DirectionalLight("sun", lvec, scene)
				// light.diffuse = new BABYLON.Color3(1, 0, 0)
				// const light = new BABYLON.PointLight("sun", lpos, scene)
				sun.position = lpos
				torus.position = lpos
				sun.intensity = 2
				logic.add(() => {
					const position = camera.position.clone().add(lpos)
					sun.position = position
					torus.position = position
				})

				const antidirection = lvec.negate().addInPlace(new BABYLON.Vector3(0.3, 0.2, 0.1))
				const antilight = new BABYLON.HemisphericLight("antilight", antidirection, scene)
				antilight.intensity = 0.1

				const shadowGenerator = new BABYLON.ShadowGenerator(2048, sun)
				shadowGenerator.bias = 0.0001
				shadowGenerator.forceBackFacesOnly = true
				shadowGenerator.usePoissonSampling = true
				shadowGenerator.useExponentialShadowMap = true
				shadowGenerator.useBlurExponentialShadowMap = true

				for (const mesh of assets.meshes) {
					if (
							scene.meshes.includes(mesh) &&
							mesh !== skybox &&
							mesh.isVisible &&
							mesh !== root
						) {

						shadowGenerator.addShadowCaster(mesh)

						if ((<BABYLON.Mesh>mesh).isAnInstance) {
							const {sourceMesh} = <BABYLON.InstancedMesh>mesh
							sourceMesh.receiveShadows = true
						}
						else {
							mesh.receiveShadows = true
						}
					}
				}

				return {
					middle,
				}
			},
		},
	}
}
