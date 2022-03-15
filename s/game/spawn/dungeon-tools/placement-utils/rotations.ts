
import {DungeonDoors} from "../../../utils/dungeon-generator/dungeon-types.js"

const axis = new BABYLON.Vector3(0, 1, 0)
const quarterTurn = (Math.PI / 2)

export function rotateStartOrEndToMatchDoor(mesh: BABYLON.AbstractMesh, doors: DungeonDoors) {
	// starts pointing east
	if (doors.north) mesh.rotate(axis, quarterTurn)
	else if (doors.west) mesh.rotate(axis, quarterTurn * 2)
	else if (doors.south) mesh.rotate(axis, quarterTurn * 3)
}

export function rotateStraightToMatchDoors(mesh: BABYLON.AbstractMesh, doors: DungeonDoors) {
	if (doors.north)
		mesh.rotate(axis, quarterTurn)
}

export function rotateCornerToMatchDoors(mesh: BABYLON.AbstractMesh, doors: DungeonDoors) {
	// starts pointing south-west
	if (doors.south && doors.east) mesh.rotate(axis, quarterTurn)
	else if (doors.east && doors.north) mesh.rotate(axis, quarterTurn * 2)
	else if (doors.north && doors.west) mesh.rotate(axis, quarterTurn * 3)
}
