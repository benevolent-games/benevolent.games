
import {V2} from "../v2.js"
import * as v2 from "../v2.js"
import {RandomTools} from "../random-tools.js"
import {DungeonDoors, DungeonTile, DungeonTileSubdivided} from "./dungeon-types.js"
import {preparePathing} from "./internal/pathing.js"

export function dungeonGenerator(randomTools: RandomTools) {
	const pathing = preparePathing(randomTools)

	function openDoorBetween(doorsA: DungeonDoors, pointA: V2, pointB: V2) {
		const diff = v2.subtract(pointA, pointB)

		if (v2.equal(diff, [0, -1]))
			doorsA.north = true
	
		if (v2.equal(diff, [-1, 0]))
			doorsA.east = true

		if (v2.equal(diff, [0, 1]))
			doorsA.south = true

		if (v2.equal(diff, [1, 0]))
			doorsA.west = true
	}

	function pathToDoors(path: V2[]) {
		const allDoors: DungeonDoors[] = []
		path.forEach(([x, y], index) => {
			const previousIndex = index - 1
			const nextIndex = index + 1
	
			const previous = previousIndex >= 0
				? path[previousIndex]
				: undefined
	
			const next = nextIndex < path.length
				? path[nextIndex]
				: undefined
	
			const tileDoors: DungeonDoors = {
				north: false,
				east: false,
				south: false,
				west: false,
			}
			
			if (previous)
				openDoorBetween(tileDoors, [x, y], previous)
	
			if (next)
				openDoorBetween(tileDoors, [x, y], next)
			
			allDoors.push(tileDoors)
		})
		return allDoors
	}

	const positionsIn3x3 = {
		north: <V2>[1, 2],
		east: <V2>[2, 1],
		south: <V2>[1, 0],
		west: <V2>[0, 1],
	}

	function doorsToPositions(doors: DungeonDoors) {
		const positions: V2[] = []
		if (doors.north) positions.push(positionsIn3x3.north)
		if (doors.east) positions.push(positionsIn3x3.east)
		if (doors.south) positions.push(positionsIn3x3.south)
		if (doors.west) positions.push(positionsIn3x3.west)
		return positions
	}

	function openOutsideDoor(subsegment: DungeonTile) {
		if (v2.equal(subsegment.point, positionsIn3x3.north)) subsegment.doors.north = true
		if (v2.equal(subsegment.point, positionsIn3x3.east)) subsegment.doors.east = true
		if (v2.equal(subsegment.point, positionsIn3x3.south)) subsegment.doors.south = true
		if (v2.equal(subsegment.point, positionsIn3x3.west)) subsegment.doors.west = true
	}

	function subdivideTile(tile: DungeonTile): DungeonTileSubdivided {
		const [start, end] = doorsToPositions(tile.doors)
		const subpath = pathing.randomPathWithinGrid(3, 3, start, end)
		const subdoors = pathToDoors(subpath)
		const children = subpath.map((point, index) => ({
			point,
			doors: subdoors[index],
		}))
		const firstChild = children[0]
		const lastChild = children[children.length - 1]
		openOutsideDoor(firstChild)
		openOutsideDoor(lastChild)
		return {...tile, children}
	}

	function maybeSubdivideTile(tile: DungeonTile, percent: number) {
		return randomTools.randomBoolean(percent)
			? subdivideTile(tile)
			: tile
	}

	return {

		doorsAreStraight(doors: DungeonDoors): boolean {
			if (doors.north && doors.south)
				return true
			else if (doors.east && doors.west)
				return true
			return false
		},

		generateTilePath(pathSize: number): DungeonTile[] {
			const path = pathing.randomPath(pathSize)
			const doors = pathToDoors(path)
			return path.map((point, index) => ({
				point,
				doors: doors[index],
			}))
		},

		subdivideSomeTiles(
				tiles: DungeonTile[],
				percent: number,
			): (DungeonTile | DungeonTileSubdivided)[] {

			tiles = [...tiles]
			const firstTile = tiles.shift()
			const lastTile = tiles.pop()

			return [
				firstTile,
				...tiles.map(tile => maybeSubdivideTile(tile, percent)),
				lastTile,
			]
		},
	}
}
