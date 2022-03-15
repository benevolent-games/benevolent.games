
import {RandomTools} from "../random-tools.js"
import {preparePathing} from "./gentools/pathing.js"
import {DungeonTile, DungeonTileSubdivided} from "./dungeon-types.js"
import {doorsToPositions, openOutsideDoor, pathToDoors} from "./gentools/door-logic.js"

export function dungeonGenerator(randomTools: RandomTools) {
	const pathing = preparePathing(randomTools)

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
