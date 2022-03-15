
import {V2} from "../utils/v2.js"
import * as v2 from "../utils/v2.js"
import * as v3 from "../utils/v3.js"
import {loadGlb} from "../babylon/load-glb.js"
import {stopwatch} from "../utils/stopwatch.js"
import {dungeonGenerator} from "../utils/dungeon-generator/dungeon-generator.js"
import {DungeonTileSubdivided, DungeonDoors} from "../utils/dungeon-generator/dungeon-types.js"
import {asEntity, MapDungeonDescription, Quality, Spawner, SpawnOptions} from "../types.js"
import {pseudoRandomTools} from "../utils/random-tools.js"

export function spawnMapDungeon({scene}: SpawnOptions): Spawner<MapDungeonDescription> {
	return async function({description}) {

		scene.ambientColor = new BABYLON.Color3(1, 1, 1)

		const assets = await loadGlb(scene, "/assets/art/dungeon/dungeon.glb")
		assets.removeAllFromScene()
		assets.addAllToScene()

		const meshes = <BABYLON.Mesh[]>assets.meshes
		console.log("meshes", meshes.map(m => m.name))

		for (const mesh of meshes) {
			mesh.setParent(null)
		}

		for (const material of assets.materials) {
			console.log(material.getClassName())
			const pbr = <BABYLON.PBRMaterial>material
			pbr.ambientColor = new BABYLON.Color3(1, 1, 1)
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
		const tiles = {
			big: {
				straights: bigs.filter(m => m.name.includes("straight")),
				corners: bigs.filter(m => m.name.includes("corner")),
				starts: bigs.filter(m => m.name.includes("start")),
				ends: bigs.filter(m => m.name.includes("end")),
			},
			little: {
				straights: littles.filter(m => m.name.includes("straight")),
				corners: littles.filter(m => m.name.includes("corner")),
				starts: littles.filter(m => m.name.includes("start")),
				ends: littles.filter(m => m.name.includes("end")),
			},
		}
		console.log("tiles", tiles)
		console.log(`dungeon seed ${description.seed}`)

		const generationTimer = stopwatch()
		const randomTools = pseudoRandomTools(description.seed)
		const dungeonGen = dungeonGenerator(randomTools)
		const dungeon = dungeonGen.generateTilePath(description.pathSize)
		const sectors = dungeonGen.subdivideSomeTiles(dungeon, description.amountOfLittleTiles)
		console.log(`dungeon generator took ${generationTimer.elapsed().toFixed(0)}ms`)
		console.log("dungeon sectors", sectors)

		const bigSize = 60
		const littleSize = 20
		const placementTimer = stopwatch()

		function subposition(bigPoint: V2, littlePoint: V2) {
			const bigOffset = v2.addBy(
				v2.multiplyBy(bigPoint, bigSize),
				-(bigSize / 2)
			)
			const littleOffset = v2.multiplyBy(littlePoint, littleSize)
			const totalOffset = v2.add(bigOffset, littleOffset)
			return v2.addBy(
				totalOffset,
				littleSize / 2
			)
		}

		function makeInstance(mesh: BABYLON.Mesh, x: number, z: number) {
			const instance = mesh.createInstance("mapinstance")
			instance.setParent(null)
			instance.physicsImpostor = new BABYLON.PhysicsImpostor(
				instance,
				BABYLON.PhysicsImpostor.MeshImpostor,
				{mass: 0, friction: 1, restitution: 0.1},
			)
			instance.position.x = x
			instance.position.z = z
			return instance
		}

		sectors.forEach((sector, index) => {
			const {point, doors} = sector
			if ((<DungeonTileSubdivided>sector).children) {
				const {children: subpath} = <DungeonTileSubdivided>sector
				subpath.forEach((sub, index) => {
					const [worldX, worldZ] = subposition(point, sub.point)
					const straight = dungeonGen.doorsAreStraight(sub.doors)
					const randomMesh = straight
						? randomTools.randomSelect(tiles.little.straights)
						: randomTools.randomSelect(tiles.little.corners)
					const instance = makeInstance(randomMesh, worldX, worldZ)
					if (straight)
						rotateStraightToMatchDoors(instance, sub.doors)
					else
						rotateCornerToMatchDoors(instance, sub.doors)
				})
			}
			else {
				const [x, y] = point
				const worldX = x * bigSize
				const worldZ = y * bigSize
				const isStart = index === 0
				const isEnd = index === dungeon.length - 1
				if (isStart || isEnd) {
					const randomMesh = isStart
						? randomTools.randomSelect(tiles.big.starts)
						: randomTools.randomSelect(tiles.big.ends)
					const instance = makeInstance(randomMesh, worldX, worldZ)
					rotateStartOrEndToMatchDoor(instance, doors)
				}
				else {
					const straight = dungeonGen.doorsAreStraight(doors)
					const randomMesh = straight
						? randomTools.randomSelect(tiles.big.straights)
						: randomTools.randomSelect(tiles.big.corners)
					const instance = makeInstance(randomMesh, worldX, worldZ)
					if (straight)
						rotateStraightToMatchDoors(instance, doors)
					else
						rotateCornerToMatchDoors(instance, doors)
				}
			}
		})

		for (const mesh of meshes) {
			scene.removeMesh(mesh)
		}

		console.log(`dungeon placement took ${placementTimer.elapsed().toFixed(0)}ms`)

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
