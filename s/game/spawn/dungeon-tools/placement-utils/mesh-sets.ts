
import {hatPuller} from "./hat-puller.js"
import {RandomTools} from "../../../utils/random-tools.js"

export interface TileMeshSet {
	straights: BABYLON.Mesh[]
	corners: BABYLON.Mesh[]
	starts: BABYLON.Mesh[]
	ends: BABYLON.Mesh[]
}

export function meshSetHats(randomTools: RandomTools, meshSet: TileMeshSet) {
	return {
		straights: hatPuller(randomTools, meshSet.straights),
		corners: hatPuller(randomTools, meshSet.corners),
		starts: hatPuller(randomTools, meshSet.starts),
		ends: hatPuller(randomTools, meshSet.ends),
	}
}
