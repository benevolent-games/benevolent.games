
import {RandomTools} from "../../utils/random-tools.js"
import {makeInstance} from "./placement-utils/instancing.js"
import {preparePositioning} from "./placement-utils/positioning.js"
import {meshSetHats, TileMeshSet} from "./placement-utils/mesh-sets.js"
import {isTileSubdivided} from "./placement-utils/is-tile-subdivided.js"
import {doorsAreStraight} from "../../utils/dungeon-generator/gentools/door-logic.js"
import {DungeonTile, DungeonTileSubdivided} from "../../utils/dungeon-generator/dungeon-types.js"
import {rotateCornerToMatchDoors, rotateStartOrEndToMatchDoor, rotateStraightToMatchDoors} from "./placement-utils/rotations.js"

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

	const hats = {
		big: meshSetHats(randomTools, big.meshSet),
		small: meshSetHats(randomTools, small.meshSet),
	}

	const positioning = preparePositioning({
		bigSize: big.size,
		smallSize: small.size,
	})

	const instances = new Set<BABYLON.InstancedMesh>()

	function placeStartOrEnd(tile: DungeonTile, mesh: BABYLON.Mesh) {
		const instance = makeInstance(mesh, positioning.big(tile.point))
		instances.add(instance)
		rotateStartOrEndToMatchDoor(instance, tile.doors)
	}

	function placeSubdividedTile(bigTile: DungeonTileSubdivided) {
		for (const smallTile of (<DungeonTileSubdivided>bigTile).children) {
			const isStraight = doorsAreStraight(smallTile.doors)
			const mesh = isStraight
				? hats.small.straights.pull()
				: hats.small.corners.pull()
			const point = positioning.small(bigTile.point, smallTile.point)
			const instance = makeInstance(mesh, point)
			instances.add(instance)
			if (isStraight)
				rotateStraightToMatchDoors(instance, smallTile.doors)
			else
				rotateCornerToMatchDoors(instance, smallTile.doors)
		}
	}

	function placeBigTile(bigTile: DungeonTile) {
		const isStraight = doorsAreStraight(bigTile.doors)
		const mesh = isStraight
			? hats.big.straights.pull()
			: hats.big.corners.pull()
		const point = positioning.big(bigTile.point)
		const instance = makeInstance(mesh, point)
		instances.add(instance)
		if (isStraight)
			rotateStraightToMatchDoors(instance, bigTile.doors)
		else
			rotateCornerToMatchDoors(instance, bigTile.doors)
	}

	return {

		instances,

		placeDungeon(tiles: (DungeonTile | DungeonTileSubdivided)[]) {
			tiles = [...tiles]
			const startTile = tiles.shift()
			const endTile = tiles.pop()

			placeStartOrEnd(startTile, hats.big.starts.pull())
			placeStartOrEnd(endTile, hats.big.ends.pull())

			for (const bigTile of tiles) {
				if (isTileSubdivided(bigTile))
					placeSubdividedTile(<DungeonTileSubdivided>bigTile)
				else
					placeBigTile(bigTile)
			}
		},
	}
}
