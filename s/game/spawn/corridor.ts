
import * as v3 from "../utils/v3.js"
import {SpawnOptions} from "../types.js"
import {loadGlb} from "../babylon/load-glb.js"
import {cap} from "../utils/numpty.js"

export function spawnCorridor({scene}: SpawnOptions) {
	return async function() {

		const assets = await loadGlb(scene, `/assets/art/corridor.glb`)
		const {root, meshes, lights, deleteLights} = prepareAssets(assets)

		const maxLightsPerMesh = 4

		root.position.addInPlace(v3.toBabylon([10, -1, 20]))
		scene.ambientColor = new BABYLON.Color3(1, 1, 1)
		for (const material of <BABYLON.StandardMaterial[]>scene.materials) {
			material.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1)
		}

		for (const light of [...lights]) {
			light.includedOnlyMeshes = [undefined]
			console.log("light", light.name, light.range, light.radius)
			light.range = cap(light.range, 0, 10)
		}

		const lightsAndPositions = [...lights].map(light => ({
			light: <BABYLON.PointLight>light,
			lightPosition: v3.fromBabylon((<any>light.parent).getAbsolutePosition()),
		}))

		const meshesAndPositions = [...meshes]
			.filter(m => !m.name.includes("__root__"))
			.map(mesh => ({
				mesh,
				meshPosition: v3.fromBabylon(mesh.getAbsolutePosition()),
			}))

		for (const {mesh, meshPosition} of meshesAndPositions) {
			let localLighting = [...lightsAndPositions]
			localLighting.sort((a, b) => {
				const aDistance = v3.distance(meshPosition, a.lightPosition)
				const bDistance = v3.distance(meshPosition, b.lightPosition)
				return aDistance - bDistance
			})
			localLighting = localLighting.slice(0, maxLightsPerMesh)
			console.log("mesh lights", mesh.name, localLighting.map(l => l.light.name))
			for (const {light} of localLighting) {
				light.includedOnlyMeshes = [...light.includedOnlyMeshes, mesh]
			}
		}
	}
}

function prepareAssets(assets: BABYLON.AssetContainer) {
	assets.removeAllFromScene()
	assets.addAllToScene()
	const meshes = new Set(assets.meshes)
	const lights = new Set(assets.lights)
	function deleteMeshes(toDelete: BABYLON.AbstractMesh[]) {
		for (const mesh of toDelete) {
			mesh.isVisible = false
			mesh.dispose()
			meshes.delete(mesh)
		}
	}
	function deleteLights(toDelete: BABYLON.Light[]) {
		for (const light of toDelete) {
			light.dispose()
			lights.delete(light)
		}
	}
	const root = <BABYLON.AbstractMesh>assets.getNodes().find(n => n.name.includes("__root__"))
	return {root, meshes, lights, deleteMeshes, deleteLights}
}
