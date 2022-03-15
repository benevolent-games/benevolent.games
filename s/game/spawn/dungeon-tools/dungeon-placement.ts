
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import {RandomTools} from "../../utils/random-tools.js"
import {doorsAreStraight} from "../../utils/dungeon-generator/gentools/door-logic.js"
import {DungeonDoors, DungeonTile, DungeonTileSubdivided} from "../../utils/dungeon-generator/dungeon-types.js"

export interface TileMeshSet {
	straights: BABYLON.Mesh[]
	corners: BABYLON.Mesh[]
	starts: BABYLON.Mesh[]
	ends: BABYLON.Mesh[]
}

export function dungeonPlacement({
		randomTools,
		big,
		small,
	}: {
		randomTools: RandomTools
		big: {
			size: number
			meshSet: TileMeshSet
		}
		small: {
			size: number
			meshSet: TileMeshSet
		}
	}) {

	function bigposition(bigPoint: V2) {
		return v2.multiplyBy(bigPoint, big.size)
	}

	function smallposition(bigPoint: V2, smallPoint: V2) {
		const bigOffset = v2.addBy(
			v2.multiplyBy(bigPoint, big.size),
			-(big.size / 2)
		)
		const littleOffset = v2.multiplyBy(smallPoint, small.size)
		const totalOffset = v2.add(bigOffset, littleOffset)
		return v2.addBy(
			totalOffset,
			small.size / 2
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

	function placeStartOrEnd(tile: DungeonTile, meshes: BABYLON.Mesh[]) {
		const mesh = randomTools.randomSelect(meshes)
		const [x, y] = bigposition(tile.point)
		const instance = makeInstance(mesh, x, y)
		rotateStartOrEndToMatchDoor(instance, tile.doors)
	}

	return {

		placeDungeon(tiles: (DungeonTile | DungeonTileSubdivided)[]) {
			tiles = [...tiles]
			const startTile = tiles.shift()
			const endTile = tiles.pop()

			placeStartOrEnd(startTile, big.meshSet.starts)
			placeStartOrEnd(endTile, big.meshSet.starts)

			for (const bigTile of tiles) {
				if (isTileSubdivided(bigTile)) {
					for (const smallTile of (<DungeonTileSubdivided>bigTile).children) {
						const isStraight = doorsAreStraight(smallTile.doors)
						const mesh = isStraight
							? randomTools.randomSelect(small.meshSet.straights)
							: randomTools.randomSelect(small.meshSet.corners)
						const [x, y] = smallposition(bigTile.point, smallTile.point)
						const instance = makeInstance(mesh, x, y)
						if (isStraight)
							rotateStraightToMatchDoors(instance, smallTile.doors)
						else
						rotateCornerToMatchDoors(instance, smallTile.doors)
					}
				}
				else {
					const isStraight = doorsAreStraight(bigTile.doors)
					const mesh = isStraight
						? randomTools.randomSelect(big.meshSet.straights)
						: randomTools.randomSelect(big.meshSet.corners)
					const [x, y] = bigposition(bigTile.point)
					const instance = makeInstance(mesh, x, y)
					if (isStraight)
						rotateStraightToMatchDoors(instance, bigTile.doors)
					else
						rotateCornerToMatchDoors(instance, bigTile.doors)
				}
			}
		},
	}
}

const axis = new BABYLON.Vector3(0, 1, 0)
const quarterTurn = (Math.PI / 2)

function isTileSubdivided(tile: DungeonTile | DungeonTileSubdivided) {
	return !!(<DungeonTileSubdivided>tile).children
}

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
