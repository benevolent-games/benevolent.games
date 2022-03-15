
import {V2} from "../utils/v2.js"
import * as v2 from "../utils/v2.js"
import * as v3 from "../utils/v3.js"

import {loadGlb} from "../babylon/load-glb.js"
import {stopwatch} from "../utils/stopwatch.js"
import {pseudoRandomTools} from "../utils/random-tools.js"
import {dungeonPlacement} from "./dungeon-tools/dungeon-placement.js"
import {DungeonDoors} from "../utils/dungeon-generator/dungeon-types.js"
import {dungeonGenerator} from "../utils/dungeon-generator/dungeon-generator.js"
import {asEntity, MapDungeonDescription, Spawner, SpawnOptions} from "../types.js"

export function spawnMapDungeon({scene}: SpawnOptions): Spawner<MapDungeonDescription> {
	return async function({description}) {

		scene.ambientColor = new BABYLON.Color3(0.06, 0.06, 0.06)

		const assets = await loadGlb(scene, "/assets/art/dungeon/dungeon.glb")
		assets.removeAllFromScene()
		const meshes = <BABYLON.Mesh[]>assets.meshes
		console.log("🧺 dungeon meshes", meshes.map(m => m.name))
		for (const mesh of meshes) {
			mesh.setParent(null)
		}
		for (const material of assets.materials) {
			const pbr = <BABYLON.PBRMaterial>material
			pbr.ambientColor = new BABYLON.Color3(1, 1, 1)
			pbr.backFaceCulling = true
		}

		const ground = BABYLON.CreateGround("", {
			height: 1000,
			width: 1000,
		}, scene)
		ground.physicsImpostor = new BABYLON.PhysicsImpostor(
			ground,
			BABYLON.PhysicsImpostor.PlaneImpostor,
		)
		ground.position.y = 50
		ground.isVisible = false

		const bigs = meshes.filter(m => m.name.startsWith("60x60m"))
		const littles = meshes.filter(m => m.name.startsWith("20x20m"))

		const randomTools = pseudoRandomTools(description.seed)
		const generator = dungeonGenerator(randomTools)
		const placement = dungeonPlacement({
			randomTools,
			big: {
				size: 60,
				meshSet: {
					straights: bigs.filter(m => m.name.includes("straight")),
					corners: bigs.filter(m => m.name.includes("corner")),
					starts: bigs.filter(m => m.name.includes("start")),
					ends: bigs.filter(m => m.name.includes("end")),
				},
			},
			small: {
				size: 20,
				meshSet: {
					straights: littles.filter(m => m.name.includes("straight")),
					corners: littles.filter(m => m.name.includes("corner")),
					starts: littles.filter(m => m.name.includes("start")),
					ends: littles.filter(m => m.name.includes("end")),
				},
			},
		})

		console.log(`🌱 dungeon seed ${description.seed}`)
		const generationTimer = stopwatch()
		const dungeonBigTiles = generator.generateTilePath(description.pathSize)
		const dungeonTiles = generator.subdivideSomeTiles(dungeonBigTiles, description.amountOfLittleTiles)
		console.log(`⏱️ dungeon generator took ${generationTimer.elapsed().toFixed(0)}ms`)

		const placementTimer = stopwatch()
		placement.placeDungeon(dungeonTiles)
		console.log(`⏱️ dungeon placement took ${placementTimer.elapsed().toFixed(0)}ms`)

		const lightDirection = v3.toBabylon(v3.normalize([0.7, -1, 0.2]))
		const sun = new BABYLON.DirectionalLight("", lightDirection, scene)
		sun.intensity = 4

		return asEntity<MapDungeonDescription>({
			update() {},
			describe: () => description,
			dispose() {
				console.error("cannot dispose environment")
			},
			receiveMemo() {},
		})
	}
}

const axis = new BABYLON.Vector3(0, 1, 0)
const quarterTurn = (Math.PI / 2)

function rotateStartOrEndToMatchDoor(mesh: BABYLON.AbstractMesh, doors: DungeonDoors) {
	// starts pointing east
	if (doors.north) mesh.rotate(axis, quarterTurn)
	else if (doors.west) mesh.rotate(axis, quarterTurn * 2)
	else if (doors.south) mesh.rotate(axis, quarterTurn * 3)
}

function rotateStraightToMatchDoors(mesh: BABYLON.AbstractMesh, doors: DungeonDoors) {
	if (doors.north)
		mesh.rotate(axis, quarterTurn)
}

function rotateCornerToMatchDoors(mesh: BABYLON.AbstractMesh, doors: DungeonDoors) {
	// starts pointing south-west
	if (doors.south && doors.east) mesh.rotate(axis, quarterTurn)
	else if (doors.east && doors.north) mesh.rotate(axis, quarterTurn * 2)
	else if (doors.north && doors.west) mesh.rotate(axis, quarterTurn * 3)
}
