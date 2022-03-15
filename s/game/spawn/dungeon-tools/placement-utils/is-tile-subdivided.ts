
import {DungeonTile, DungeonTileSubdivided} from "../../../utils/dungeon-generator/dungeon-types.js"

export function isTileSubdivided(tile: DungeonTile | DungeonTileSubdivided) {
	return !!(<DungeonTileSubdivided>tile).children
}
