
import {V3} from "../utils/v3.js"
import {SpawnOptions} from "../types.js"
import {loadGlb} from "../babylon/load-glb.js"
import {loadMaterial} from "../babylon/load-material.js"

export function spawnEnvironment({scene, renderLoop}: SpawnOptions) {
	return async function({getCameraPosition}: {
			getCameraPosition: () => V3
		}) {

		const assets = await loadGlb(scene, "/assets/environment.poo.glb")
		assets.removeAllFromScene()
		assets.addAllToScene()
		const root = scene.rootNodes.find(node => node.name.includes("__root__"))
		const meshes = new Set(assets.meshes)
		function deleteMeshes(toDelete: BABYLON.AbstractMesh[]) {
			for (const mesh of toDelete) {
				mesh.isVisible = false
				if (!(mesh instanceof BABYLON.InstancedMesh))
					mesh.receiveShadows = false
				mesh.dispose()
				meshes.delete(mesh)
			}
		}

		hideMeshes(selectOriginMeshes([...meshes], assets.rootNodes))
		deleteMeshes(selectLod(2, [...meshes]))

		const statics = selectStatics([...meshes])
		applyStaticPhysics({meshes: selectStatics([...meshes])})
		for (const mesh of statics)
			mesh.isVisible = false

		const texturesDirectory = "/textures/1"
		const terrainMesh = [...meshes].find(m => m.name === "terrain")
		const rockslideMeshes = [...meshes].filter(m => m.name.includes("rockslide"))
		await Promise.all([
			applyTerrainShader({scene, texturesDirectory, meshes: [terrainMesh]}),
			applyRockslideShader({scene, texturesDirectory, meshes: rockslideMeshes}),
		])

		// hideMeshes([...meshes])
		// terrainMesh.isVisible = true

		const skycolor = applySkyColor(scene, [0.5, 0.6, 1])
		const skybox = makeSkybox({
			scene,
			size: 20_000,
			color: skycolor,
			cubeTexturePath: `/assets/skybox2/sky`,
		})

		const {sun, torus} = makeSunlight({
			scene,
			renderLoop,
			lightPositionRelativeToCamera: [2000, 2000, -2000],
			getCameraPosition,
		})

		const shadowables = [...meshes].filter(mesh => (
			(
				mesh.name.includes("terrain") ||
				mesh.name.includes("cliff") ||
				mesh.name.includes("cliff")
			) &&
			mesh.isVisible
		))

		applyShadows({
			light: sun,
			casters: shadowables,
			receivers: [<BABYLON.Mesh>terrainMesh],
			bias: 0.0001,
			resolution: 1024,
		})
	}
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

	const antidirection = lightDirection.negate().addInPlace(new BABYLON.Vector3(0.3, 0.2, 0.1))
	const antilight = new BABYLON.HemisphericLight("antilight", antidirection, scene)
	antilight.intensity = 0.1

	return {sun, antilight, torus}
}

function applySkyColor(scene: BABYLON.Scene, color: [number, number, number]) {
	const skycolor = new BABYLON.Color3(...color)
	scene.clearColor = new BABYLON.Color4(...color, 1)
	// scene.ambientColor = skycolor
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
		path: "/assets/shaders/terrainshader4.json",
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
		path: "/assets/shaders/rockslideshader.json",
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

function applyStaticPhysics({meshes}: {meshes: BABYLON.AbstractMesh[]}) {
	const statics = meshes.filter(
		mesh => {
			const name = mesh.name.toLowerCase()
			return (
				name.includes("static_") ||
				name.includes(".static")
			)
		}
	)
	for (const mesh of statics) {
		if (!mesh.isAnInstance) {
			mesh.setParent(null)
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
}

function selectOriginMeshes(meshes: BABYLON.AbstractMesh[], rootNodes: BABYLON.Node[]) {
	return meshes.filter(mesh => mesh.isAnInstance && rootNodes.includes(mesh.parent))
}

function hideMeshes(meshes: BABYLON.AbstractMesh[]) {
	for (const mesh of meshes)
		mesh.isVisible = false
}

function makeSkybox({scene, size, color}: {
		cubeTexturePath: string
		scene: BABYLON.Scene
		size: number
		color: BABYLON.Color3
	}) {
	const box = BABYLON.MeshBuilder.CreateBox("skyBox", {size}, scene)
	const material = new BABYLON.StandardMaterial("skyBox", scene)
	material.backFaceCulling = false
	material.reflectionTexture = new BABYLON.CubeTexture("/assets/skybox2/sky", scene)
	material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
	material.diffuseColor = color
	material.specularColor = color
	box.material = material
	box.infiniteDistance = true
	material.disableLighting = true
	box.applyFog = false
	return box
}

function applyShadows({light, casters, receivers, resolution, bias}: {
		light: BABYLON.IShadowLight
		casters: BABYLON.AbstractMesh[]
		receivers: BABYLON.Mesh[]
		resolution: number
		bias: number
	}) {

	const shadows = new BABYLON.ShadowGenerator(resolution, light)
	shadows.bias = bias
	shadows.forceBackFacesOnly = true
	shadows.usePoissonSampling = true
	shadows.useExponentialShadowMap = true
	shadows.useBlurExponentialShadowMap = true

	for (const mesh of casters)
		shadows.addShadowCaster(mesh)

	for (const mesh of receivers)
		mesh.receiveShadows = true
}
