
import * as v3 from "../utils/v3.js"
import {loadGlb} from "../babylon/load-glb.js"
import {asEntity, MapDesertDescription, Spawner, SpawnOptions} from "../types.js"

export function spawnMapButte({quality, scene, renderLoop}: SpawnOptions): Spawner<MapDesertDescription> {
	return async function({description}) {
		const assets = await loadGlb(scene, `/assets/art/butte/butte.${quality}.glb`)

		scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1)
		for (const material of <(BABYLON.StandardMaterial | BABYLON.PBRMaterial)[]>assets.materials) {
			material.ambientColor = new BABYLON.Color3(1, 1, 1)
		}

		for (const light of assets.lights)
			scene.removeLight(light)

		applyStaticPhysics(assets.meshes)

		const getCameraPosition = () => {
			return v3.fromBabylon(scene.activeCamera.globalPosition)
		}

		const texturesHq = "/textures/lod0"

		makeSkybox({
			scene,
			size: 5_000,
			color: applySkyColor(scene, [0.5, 0.6, 1]),
			cubeTexturePath: `${texturesHq}/desert/sky/cloudy/bluecloud`,
			extensions: [
				"_ft.jpg",
				"_up.jpg",
				"_rt.jpg",
				"_bk.jpg",
				"_dn.jpg",
				"_lf.jpg",
			],
		})

		const {sun} = makeSunlight({
			scene,
			renderLoop,
			lightPositionRelativeToCamera: [500, 500, -500],
			getCameraPosition,
		})

		applyShadows({
			light: sun,
			casters: assets.meshes,
			receivers: <BABYLON.Mesh[]>assets.meshes
				.filter(m => !m.isAnInstance)
				.filter(m => m.name.includes("baselevel") || m.name.includes("rock")),
			bias: 0.001,
			minZ: 200,
			maxZ: 1000,
			blurScale: 2,
			highQualityFiltering: quality === "q0",
			resolution: quality === "q0"
				? 4096
				: 1024,
		})

		return asEntity<MapDesertDescription>({
			update() {},
			describe: () => description,
			dispose() {
				console.error("cannot dispose environment")
			},
			receiveMemo() {},
		})
	}
}

function makeSunlight({
		scene, renderLoop, lightPositionRelativeToCamera, getCameraPosition
	}: {
		scene: BABYLON.Scene
		renderLoop: Set<() => void>
		lightPositionRelativeToCamera: [number, number, number]
		getCameraPosition: () => [number, number, number]
	}) {

	const lightPosition = new BABYLON.Vector3(...lightPositionRelativeToCamera)
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

	return {sun, torus}
}

function applySkyColor(scene: BABYLON.Scene, color: [number, number, number]) {
	const skycolor = new BABYLON.Color3(...color)
	scene.clearColor = new BABYLON.Color4(...color, 1)
	scene.fogColor = skycolor
	scene.fogMode = BABYLON.Scene.FOGMODE_EXP2
	scene.fogDensity = 0.00007
	return skycolor
}

function applyStaticPhysics(meshes: BABYLON.AbstractMesh[]) {
	const sources = new Set<BABYLON.Mesh>()
	const instances = new Set<BABYLON.InstancedMesh>()
	for (const mesh of meshes) {
		if (mesh.isAnInstance) {
			instances.add(<BABYLON.InstancedMesh>mesh)
			sources.add((<BABYLON.InstancedMesh>mesh).sourceMesh)
		}
		else
			sources.add(<BABYLON.Mesh>mesh)
	}

	for (const sourceMesh of sources) {
		sourceMesh.setParent(null)
		sourceMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
			sourceMesh,
			BABYLON.PhysicsImpostor.MeshImpostor,
			{mass: 0, friction: 1, restitution: 0.1}
		)
	}
}

function makeSkybox({cubeTexturePath, extensions, scene, size, color}: {
		cubeTexturePath: string
		scene: BABYLON.Scene
		size: number
		color: BABYLON.Color3
		extensions: [string, string, string, string, string, string]
	}) {
	const box = BABYLON.MeshBuilder.CreateBox("skybox", {size}, scene)
	const material = new BABYLON.StandardMaterial("skybox", scene)
	material.backFaceCulling = false
	material.reflectionTexture = new BABYLON.CubeTexture(cubeTexturePath, scene, extensions)
	material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
	material.diffuseColor = color
	material.specularColor = color
	box.material = material
	box.infiniteDistance = true
	material.disableLighting = true
	box.applyFog = false
}

function applyShadows({
		light, casters, receivers, resolution, bias, minZ, maxZ, blurScale,
		highQualityFiltering,
	}: {
		light: BABYLON.IShadowLight
		casters: BABYLON.AbstractMesh[]
		receivers: BABYLON.Mesh[]
		resolution: number
		bias: number
		minZ: number
		maxZ: number
		blurScale: number
		highQualityFiltering: boolean
	}) {

	light.shadowMinZ = minZ
	light.shadowMaxZ = maxZ

	const shadows = new BABYLON.ShadowGenerator(resolution, light)
	shadows.bias = bias
	shadows.useKernelBlur = true
	shadows.useCloseExponentialShadowMap = true
	shadows.useBlurCloseExponentialShadowMap = true
	shadows.blurScale = blurScale
	shadows.filteringQuality = highQualityFiltering
		? BABYLON.ShadowGenerator.QUALITY_HIGH
		: BABYLON.ShadowGenerator.QUALITY_LOW

	for (const mesh of casters)
		shadows.addShadowCaster(mesh)

	for (const mesh of receivers)
		mesh.receiveShadows = true
}
