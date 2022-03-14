
import * as v3 from "../utils/v3.js"
import {loadGlb} from "../babylon/load-glb.js"
import {loadMaterial} from "../babylon/load-material.js"
import {asEntity, MapDesertDescription, Quality, Spawner, SpawnOptions} from "../types.js"
import {Doors, dungeonGenerator} from "../utils/dungeon-generator/dungeon-generator.js"

export function spawnMapDungeon({quality, scene, renderLoop}: SpawnOptions): Spawner<MapDesertDescription> {
	return async function({description}) {

		scene.ambientColor = new BABYLON.Color3(1, 1, 1)
		const assets = await loadGlb(scene, "/assets/art/dungeon/dungeon.glb")
		assets.removeAllFromScene()

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

		const meshes = <BABYLON.Mesh[]>assets.meshes
		console.log("meshes", meshes.map(m => m.name))
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

		const dungeonGen = dungeonGenerator(description.seed)
		const dungeon = dungeonGen.generateDungeonPath(description.pathSize)
		const bigSize = 60
		const littleSize = 20

		console.log("dungeon", dungeon)

		dungeon.forEach(({point, doors}, index) => {
			const [x, y] = point
			const worldX = x * bigSize
			const worldZ = y * bigSize
			const isStart = index === 0
			const isEnd = index === dungeon.length - 1
			if (isStart || isEnd) {
				const randomMesh = isStart
					? dungeonGen.randomSelect(tiles.big.starts)
					: dungeonGen.randomSelect(tiles.big.ends)
				const instance = randomMesh.createInstance("")
				instance.position.x = worldX
				instance.position.z = worldZ
				rotateStartOrEndToMatchDoor(instance, doors)
			}
			else {
				const straight = dungeonGen.doorsAreStraight(doors)
				console.log(x, y, straight, doors)
				const randomMesh = straight
					? dungeonGen.randomSelect(tiles.big.straights)
					: dungeonGen.randomSelect(tiles.big.corners)
				const instance = randomMesh.createInstance("")
				instance.position.x = worldX
				instance.position.z = worldZ
				if (straight)
					rotateStraightToMatchDoors(instance, doors)
				else
					rotateCornerToMatchDoors(instance, doors)
			}
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

function rotateStartOrEndToMatchDoor(instance: BABYLON.InstancedMesh, doors: Doors) {
	const axis = new BABYLON.Vector3(0, 1, 0)
	const quarterTurn = (Math.PI / 2)
	if (doors.north)
		instance.rotate(axis, quarterTurn)
	if (doors.east)
		instance.rotate(axis, quarterTurn * 2)
	if (doors.south)
		instance.rotate(axis, quarterTurn * 3)
}

function rotateStraightToMatchDoors(instance: BABYLON.InstancedMesh, doors: Doors) {
	if (doors.north) {
		instance.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2)
	}
}

function rotateCornerToMatchDoors(instance: BABYLON.InstancedMesh, doors: Doors) {
	const axis = new BABYLON.Vector3(0, 1, 0)
	const quarterTurn = (Math.PI / 2)
	if (doors.south && doors.west)
		instance.rotate(axis, quarterTurn)
	else if (doors.west && doors.north)
		instance.rotate(axis, quarterTurn * 2)
	else if (doors.north && doors.east)
		instance.rotate(axis, quarterTurn * 3)
}
