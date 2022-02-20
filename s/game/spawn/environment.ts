
import * as v3 from "../utils/v3.js"
import {loadGlb} from "../babylon/load-glb.js"
import {loadMaterial} from "../babylon/load-material.js"
import {asEntity, EnvironmentDescription, Quality, Spawner, SpawnOptions} from "../types.js"

export function spawnEnvironment({quality, scene, renderLoop}: SpawnOptions): Spawner<EnvironmentDescription> {
	return async function({description}) {

		scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1)

		const getCameraPosition = () => {
			return v3.fromBabylon(scene.activeCamera.globalPosition)
		}

		const assets = await loadGlb(scene, `/assets/art/desert/terrain/terrain.${quality}.glb`)
		const {meshes, deleteMeshes} = prepareAssets(assets)

		hideMeshes(selectLod(2, [...meshes]))

		if (quality === "q0") {
			hideMeshes(selectLod(1, select([...meshes], "cliff", "rock")))
		}

		const cliffMaterials = new Set<BABYLON.PBRMaterial>()
		for (const cliff of select([...meshes], "cliff")) {
			if (cliff.material)
				cliffMaterials.add(<BABYLON.PBRMaterial>cliff.material)
		}
		const white = new BABYLON.Color3(1, 1, 1)
		for (const material of cliffMaterials) {
			material.ambientColor = white
		}
		

		const unwantedOriginMeshCopies = except(selectOriginMeshes([...meshes]), "terrain")
		hideMeshes(unwantedOriginMeshCopies)

		const physicsForCliffsAndRocks = selectLod(1, select([...meshes], "cliff", "rock"))
			.filter(mesh => !unwantedOriginMeshCopies.includes(mesh))

		applyStaticPhysics(physicsForCliffsAndRocks)

		const statics = selectStatics([...meshes])
		applyStaticPhysics(statics)
		hideMeshes(statics)

		const texturesHq = "/textures/lod0"
		const textures = quality === "q0"
			? "/textures/lod0"
			: "/textures/lod1"

		const terrainMesh = <BABYLON.Mesh>[...meshes].find(m => m.name === "terrain")
		await Promise.all([
			applyTerrainShader({
				scene,
				texturesDirectory: textures,
				meshes: [terrainMesh],
			}),
			applyRockslideShader({
				scene,
				texturesDirectory: textures,
				meshes: [...meshes].filter(m => m.name.includes("rockslide")),
			}),
		])

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
			lightPositionRelativeToCamera: [1000, 1000, -1000],
			getCameraPosition,
		})

		const shadowy = select(
			[
				terrainMesh,
				...selectLod(quality === "q0" ? 0 : 1, [...meshes]),
			],
			"terrain", "cliff", "rock",
		)

		applyShadows({
			quality,
			light: sun,
			casters: shadowy,
			receivers: <BABYLON.Mesh[]>shadowy.filter(m => !m.isAnInstance),
			bias: 0.0001,
			resolution: quality === "q0"
				? 4096
				: 1024,
		})

		return asEntity<EnvironmentDescription>({
			update() {},
			describe: () => description,
			dispose() {
				console.error("cannot dispose environment")
			},
			receiveMemo() {},
		})
	}
}

function prepareAssets(assets: BABYLON.AssetContainer) {
	const meshes = new Set(assets.meshes)
	function deleteMeshes(toDelete: BABYLON.AbstractMesh[]) {
		for (const mesh of toDelete) {
			mesh.isVisible = false
			mesh.dispose()
			meshes.delete(mesh)
		}
	}
	return {meshes, deleteMeshes}
}

function distinguish(meshes: BABYLON.AbstractMesh[], ...searches: string[]) {
	const included: BABYLON.AbstractMesh[] = []
	const excluded: BABYLON.AbstractMesh[] = []
	for (const mesh of meshes) {
		let meshShouldBeIncluded = false
		for (const search of searches) {
			if (mesh.name.includes(search)) {
				meshShouldBeIncluded = true
				break
			}
		}
		if (meshShouldBeIncluded)
			included.push(mesh)
		else
			excluded.push(mesh)
	}
	return {included, excluded}
}

function select(meshes: BABYLON.AbstractMesh[], ...searches: string[]) {
	return meshes.filter(mesh => {
		for (const search of searches)
			if (mesh.name.includes(search))
				return true
		return false
	})
}

function except(meshes: BABYLON.AbstractMesh[], ...searches: string[]) {
	return meshes.filter(mesh => {
		for (const search of searches)
			if (mesh.name.includes(search))
				return false
		return true
	})
}

function selectLod(lod: number, meshes: BABYLON.AbstractMesh[]) {
	return meshes.filter(mesh => mesh.name.endsWith(".lod" + lod))
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

async function applyTerrainShader({scene, texturesDirectory, meshes}: {
		scene: BABYLON.Scene
		texturesDirectory: string
		meshes: BABYLON.AbstractMesh[]
	}) {
	const nodeMaterial = await loadMaterial({
		scene,
		label: "terrain-material",
		path: "/assets/art/desert/terrain/terrain.shader.json",
	}).then(m => m.assignTextures({
		blendmask: `${texturesDirectory}/desert/terrain/blendmask.jpg`,
		layer1_armd: `${texturesDirectory}/desert/terrain/layer1_armd.jpg`,
		layer1_color: `${texturesDirectory}/desert/terrain/layer1_color.jpg`,
		layer1_normal: `${texturesDirectory}/desert/terrain/layer1_normal.jpg`,
		layer2_armd: `${texturesDirectory}/desert/terrain/layer2_armd.jpg`,
		layer2_color: `${texturesDirectory}/desert/terrain/layer2_color.jpg`,
		layer2_normal: `${texturesDirectory}/desert/terrain/layer2_normal.jpg`,
		layer3_armd: `${texturesDirectory}/desert/terrain/layer3_armd.jpg`,
		layer3_color: `${texturesDirectory}/desert/terrain/layer3_color.jpg`,
		layer3_normal: `${texturesDirectory}/desert/terrain/layer3_normal.jpg`,
	}))
	// const block = <BABYLON.InputBlock>nodeMaterial.getBlockByName("ambientColor")
	// block.value = new BABYLON.Color3(1, 1, 1)
	for (const mesh of meshes)
		mesh.material = nodeMaterial
}


async function applyRockslideShader({scene, texturesDirectory, meshes}: {
		scene: BABYLON.Scene
		texturesDirectory: string
		meshes: BABYLON.AbstractMesh[]
	}) {
	const nodeMaterial = await loadMaterial({
		scene,
		label: "rockslide-material",
		path: "/assets/art/desert/terrain/rockslide.shader.json",
	}).then(m => m.assignTextures({
		nor: `${texturesDirectory}/desert/rockslides/rockslide_nor.jpg`,
		color: `${texturesDirectory}/desert/rockslides/rockslide_col.jpg`,
		roughness: `${texturesDirectory}/desert/rockslides/rockslide_rgh.jpg`,
		ao: `${texturesDirectory}/desert/rockslides/rockslide_ao.jpg`,
	}))
	const rockslideMeshes = meshes.filter(m => m.name.includes("rockslide"))
	for (const mesh of rockslideMeshes) {
		if (!mesh.isAnInstance)
			mesh.material = nodeMaterial
	}
}

function selectStatics(meshes: BABYLON.AbstractMesh[]) {
	return meshes.filter(
		mesh => {
			const name = mesh.name.toLowerCase()
			return (
				name.includes("static_") ||
				name.includes(".static")
			)
		}
	)
}

function applyStaticPhysics(meshes: BABYLON.AbstractMesh[]) {
	for (const mesh of meshes) {
		mesh.setParent(null)
		mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
			mesh,
			BABYLON.PhysicsImpostor.MeshImpostor,
			{mass: 0, friction: 1, restitution: 0.1}
		)
	}
}

function selectOriginMeshes(meshes: BABYLON.AbstractMesh[]) {
	return meshes.filter(mesh => {
		const {x, y, z} = mesh.getAbsolutePosition()
		return (
			x === 0 &&
			y === 0 &&
			z === 0
		)
	})
}

function hideMeshes(meshes: BABYLON.AbstractMesh[]) {
	for (const mesh of meshes)
		mesh.isVisible = false
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

function applyShadows({quality, light, casters, receivers, resolution, bias}: {
		quality: Quality
		light: BABYLON.IShadowLight
		casters: BABYLON.AbstractMesh[]
		receivers: BABYLON.Mesh[]
		resolution: number
		bias: number
	}) {

	light.shadowMinZ = 500
	light.shadowMaxZ = 2000

	const shadows = new BABYLON.ShadowGenerator(resolution, light)
	shadows.bias = bias
	shadows.forceBackFacesOnly = true
	shadows.useCloseExponentialShadowMap = true
	shadows.useBlurCloseExponentialShadowMap = true
	shadows.usePercentageCloserFiltering = true
	shadows.blurScale = 2
	shadows.filteringQuality = quality === "q0"
		? BABYLON.ShadowGenerator.QUALITY_HIGH
		: BABYLON.ShadowGenerator.QUALITY_LOW

	for (const mesh of casters)
		shadows.addShadowCaster(mesh)

	for (const mesh of receivers)
		mesh.receiveShadows = true
}
