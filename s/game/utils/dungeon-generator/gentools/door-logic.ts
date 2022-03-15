
import {V2} from "../../v2.js"
import * as v2 from "../../v2.js"
import {DungeonDoors, DungeonTile} from "../dungeon-types.js"

const positionsIn3x3 = {
	north: <V2>[1, 2],
	east: <V2>[2, 1],
	south: <V2>[1, 0],
	west: <V2>[0, 1],
}

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

export function pathToDoors(path: V2[]) {
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

export function doorsToPositions(doors: DungeonDoors) {
	const positions: V2[] = []
	if (doors.north) positions.push(positionsIn3x3.north)
	if (doors.east) positions.push(positionsIn3x3.east)
	if (doors.south) positions.push(positionsIn3x3.south)
	if (doors.west) positions.push(positionsIn3x3.west)
	return positions
}

export function openOutsideDoor(subsegment: DungeonTile) {
	if (v2.equal(subsegment.point, positionsIn3x3.north)) subsegment.doors.north = true
	if (v2.equal(subsegment.point, positionsIn3x3.east)) subsegment.doors.east = true
	if (v2.equal(subsegment.point, positionsIn3x3.south)) subsegment.doors.south = true
	if (v2.equal(subsegment.point, positionsIn3x3.west)) subsegment.doors.west = true
}

export function doorsAreStraight(doors: DungeonDoors): boolean {
	if (doors.north && doors.south)
		return true
	else if (doors.east && doors.west)
		return true
	return false
}
