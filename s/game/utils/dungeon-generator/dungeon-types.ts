
import {V2} from "../v2.js"

export interface DungeonDoors {
	north: boolean
	east: boolean
	south: boolean
	west: boolean
}

export interface DungeonTile {
	point: V2
	doors: DungeonDoors
}

export interface DungeonTileSubdivided extends DungeonTile {
	children: DungeonTile[]
}
