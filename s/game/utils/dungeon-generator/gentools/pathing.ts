
import {V2} from "../../v2.js"
import * as v2 from "../../v2.js"
import * as numpty from "../../numpty.js"
import {RandomTools} from "../../random-tools.js"

export function preparePathing(randomTools: RandomTools) {

	function alreadyInPath(point: V2, path: V2[]) {
		for (const existingPoint of path) {
			if (v2.equal(point, existingPoint))
				return true
		}
		return false
	}

	const relativeDoorLocations: V2[] = [
		[0, 1], // north
		[1, 0], // east
		[0, -1], // south
		[-1, 0], // west
	]

	function getAdjacentPoints(current: V2, x: number, y: number) {
		const absoluteDoorLocations: V2[] = relativeDoorLocations.map(
			point => v2.add(current, point)
		)
		const inBounds = absoluteDoorLocations.filter(point => (
			numpty.withinRange(point[0], 0, x - 1) &&
			numpty.withinRange(point[1], 0, y - 1)
		))
		return inBounds
	}

	return {

		randomPath(pathSize: number) {
			const manhattanRelativeSteps: V2[] = [
				[0, 1],
				[1, 0],
				[0, -1],
				[-1, 0],
			]

			function wander(path: V2[]) {
				const current = path[path.length - 1]
				const manhattanAbsoluteSteps = manhattanRelativeSteps.map(
					point => v2.add(current, point)
				)
				const validSteps = manhattanAbsoluteSteps.filter(
					point => !alreadyInPath(point, path)
				)

				if (validSteps.length === 0)
					return undefined

				const next = randomTools.randomSelect(validSteps)

				if (alreadyInPath(next, path))
					return undefined
	
				path.push(next)

				if (path.length === pathSize)
					return path
	
				return wander(path)
			}

			const start: V2 = [0, 0]
	
			let path: V2[]
			while (!path)
				path = wander([start])

			return path
		},

		randomPathWithinGrid(x: number, y: number, start: V2, end: V2) {
			function wander(path: V2[]) {
				const current = path[path.length - 1]
				const adjacent = getAdjacentPoints(current, x, y)
					.filter(point => !alreadyInPath(point, path))

				if (adjacent.length === 0)
					return undefined

				if (alreadyInPath(end, adjacent))
					return [...path, end]

				const next = randomTools.randomSelect(adjacent)
				path.push(next)
				return wander(path)
			}

			let path: V2[]
			while (!path) {
				path = wander([start])
			}

			return path
		},
	}
}
