
import {V3} from "../utils/v3.js"
import {SpawnOptions} from "../types.js"
import {loadGlb} from "../babylon/load-glb.js"
import {loadMaterial} from "../babylon/load-material.js"

export function spawnEnvironment({scene, renderLoop}: SpawnOptions) {
	return async function(getCameraPosition: () => V3) {

		const assets = await loadGlb(scene, "/assets/environment.poo.glb")
		assets.removeAllFromScene()
		assets.addAllToScene()

		const root = scene.rootNodes.find(node => node.name.includes("__root__"))
		const terrainMesh = assets.meshes.find(m => m.name === "terrain")

		const nodeMaterial = await loadMaterial({
			scene,
			label: "terrain-material",
			path: "/assets/shaders/terrainshader4.json",
		}).then(m => m.assignTextures({
			blendmask: "/assets/textures/desert/terrain/blendmask.jpg",
			layer1_armd: "/assets/textures/desert/terrain/layer1_armd.jpg",
			layer1_color: "/assets/textures/desert/terrain/layer1_color.jpg",
			layer1_normal: "/assets/textures/desert/terrain/layer1_normal.jpg",
			layer2_armd: "/assets/textures/desert/terrain/layer2_armd.jpg",
			layer2_color: "/assets/textures/desert/terrain/layer2_color.jpg",
			layer2_normal: "/assets/textures/desert/terrain/layer2_normal.jpg",
			layer3_armd: "/assets/textures/desert/terrain/layer3_armd.jpg",
			layer3_color: "/assets/textures/desert/terrain/layer3_color.jpg",
			layer3_normal: "/assets/textures/desert/terrain/layer3_normal.jpg",
		}))

		// const perturbBlock = <BABYLON.PerturbNormalBlock>nodeMaterial.getBlockByName("Perturb normal")
		// perturbBlock.invertX = false
		terrainMesh.material = nodeMaterial

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
	}
}
