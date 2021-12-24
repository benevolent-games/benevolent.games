
import {V2} from "./utils/v2.js"
import {V3} from "./utils/v3.js"
import * as v2 from "./utils/v2.js"
import * as v3 from "./utils/v3.js"
import {loadGlb} from "./utils/load-glb.js"
import {makeKeyListener} from "./utils/key-listener.js"
import {makeMouseLooker} from "./utils/mouse-looker.js"

export async function makeGame(middle: V3 = [0, 0, 0]) {
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

	canvas.onclick = () => canvas.requestPointerLock()
	const keyListener = makeKeyListener()
	const looker = makeMouseLooker()

	;(<any>window).scene = scene

	return {
		canvas,
		resize: () => engine.resize(),
		get framerate() { return engine.getFps() },
		spawn: {

			async camera() {
				const campos = new BABYLON.Vector3(...middle)
				const camera = new BABYLON.FreeCamera("camera1", campos, scene)
				camera.attachControl(canvas, true)
				camera.minZ = 1
				camera.maxZ = 20_000
				scene.activeCamera = camera
				return {
					getCameraPosition(): V3 {
						return [
							camera.globalPosition.x,
							camera.globalPosition.y,
							camera.globalPosition.z,
						]
					},
				}
			},

			async crate(position: V3) {
				const mesh = BABYLON.Mesh.CreateBox("crate", 1, scene)
				mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
					mesh,
					BABYLON.PhysicsImpostor.BoxImpostor,
					{
						mass: 1,
						friction: 1,
						restitution: 0.5,
					}
				)
				mesh.position = new BABYLON.Vector3(...position)
			},

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
						friction: 2,
						restitution: 0,
					},
				)
				mesh.position = new BABYLON.Vector3(...position)

				const camera = new BABYLON.TargetCamera(
					"camera",
					BABYLON.Vector3.Zero(),
					scene
				)
				camera.minZ = 0.3
				camera.maxZ = 20_000
				camera.position = new BABYLON.Vector3(0, 0.75, 0)
				camera.parent = mesh
				scene.activeCamera = camera

				const box = BABYLON.Mesh.CreateBox("box1", 0.01, scene)
				box.position = new BABYLON.Vector3(0, 0, 3)
				box.parent = camera

				renderLoop.add(() => {
					const {horizontalRadians, verticalRadians} = looker.mouseLook
					mesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
						horizontalRadians,
						0,
						0
					)
					camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
						0,
						verticalRadians,
						0
					)
				})

				{
					mesh.physicsImpostor.physicsBody.setAngularFactor(0)
					function isPressed(key: string) {
						return keyListener.getKeyState(key).isDown
					}
					// const topSpeed = 2
					const power = 3_000
					mesh.physicsImpostor.registerBeforePhysicsStep(impostor => {
						impostor.wakeUp()
						const willpower = isPressed("shift")
							? power * 2.5
							: power

						let stride = 0
						let strafe = 0
						if (isPressed("w")) stride += 1
						if (isPressed("s")) stride -= 1
						if (isPressed("a")) strafe -= 1
						if (isPressed("d")) strafe += 1

						const intention = v2.rotate(
							...v2.normalize([strafe, stride]),
							-looker.mouseLook.horizontalRadians
						)

						const force = v2.multiplyBy(
							intention,
							willpower,
						)

						// const velocity3d = impostor.getLinearVelocity()
						// const velocity: V2 = [velocity3d.x, velocity3d.z]
						// const difference = v2.dot(forceDirection, velocity)
						// const distance = v2.distance(forceDirection, velocity)
						// const tanny = v2.atan2(intention, velocity)

						const [x, z] = force

						impostor.applyForce(
							new BABYLON.Vector3(x, 0, z),
							BABYLON.Vector3.Zero(),
						)
					})
				}

				return {
					getCameraPosition(): V3 {
						return [
							camera.globalPosition.x,
							camera.globalPosition.y,
							camera.globalPosition.z,
						]
					},
				}
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

			async environment(path: string, getCameraPosition: () => V3) {
				const assets = await loadGlb(scene, path)
				assets.removeAllFromScene()
				assets.addAllToScene()

				const root = scene.rootNodes.find(node => node.name.includes("__root__"))
				
				{
					const nodeMaterial = new BABYLON.NodeMaterial("node material", scene, {emitComments: false})
					nodeMaterial.setToDefault()
					
					await nodeMaterial.loadAsync("/assets/shaders/terrainshader3.json").then(() => {
						nodeMaterial.build(true)
					})
					
					const blocks = nodeMaterial.getTextureBlocks()
					for(const block of blocks)
						block.texture = new BABYLON.Texture(`/assets/shaders/terrain/${block.name}.jpg`, scene)
	
					const terrain = assets.meshes.find(m => m.name === "terrain")
					terrain.material = nodeMaterial
				}
				
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

				const lightPosition = new BABYLON.Vector3(2000, 2000, -2000)
				const lightDirection = lightPosition.negate()
				const torus = BABYLON.Mesh.CreateTorus("torus", 100, 50, 10, scene)
				const sun = new BABYLON.DirectionalLight("sun", lightDirection, scene)
				sun.position = lightPosition
				torus.position = lightPosition
				sun.intensity = 2
				renderLoop.add(() => {
					const cameraPosition = getCameraPosition()
					const position = new BABYLON.Vector3(...cameraPosition).add(lightPosition)
					sun.position = position
					torus.position = position
				})

				const antidirection = lightDirection.negate().addInPlace(new BABYLON.Vector3(0.3, 0.2, 0.1))
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
			},
		},
	}
}
