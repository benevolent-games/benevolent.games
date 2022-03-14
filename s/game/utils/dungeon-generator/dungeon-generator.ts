
import {V2} from "../v2.js"
import * as v2 from "../v2.js"
import * as numpty from "../numpty.js"

export type Random = () => number

export function randomSeed() {
	return Math.floor(Math.random() * 1_000_000)
}

function makeRandomNumberGenerator(seed: number): Random {
	function random() {
		seed = Math.imul(48271, seed) | 0 % 2147483647
		return (seed & 2147483647) / 2147483648
	}
	random()
	return random
}

export interface Doors {
	north: boolean
	east: boolean
	south: boolean
	west: boolean
}

export interface Tile {
	doors: Doors
}

export interface BigTile extends Tile {
	children?: Tile[]
}

export type AnyGrid = Tile[][]
export type DungeonGrid = BigTile[][]

export function dungeonGenerator(seed: number) {
	const random = makeRandomNumberGenerator(seed)

	function generateBigTile() {
		return {
			children: undefined,
			doors: {
				north: false,
				east: false,
				south: false,
				west: false,
			},
		}
	}

	function generateRowOfBigTiles(x: number) {
		let row: BigTile[] = []
		for (let i = 0; i < x; i++)
			row.push(generateBigTile())
		return row
	}

	function generateGridOfBigTiles(x: number, y: number) {
		const grid: DungeonGrid = []
		for (let i = 0; i < y; i++)
			grid.push(generateRowOfBigTiles(x))
		return grid
	}

	function randomSample(min: number, max: number) {
		min = Math.ceil(min)
		max = Math.floor(max)
		return Math.floor(random() * (max - min + 1)) + min
	}

	function randomPointOnGrid(x: number, y: number): V2 {
		return [
			randomSample(0, x),
			randomSample(0, y),
		]
	}

	function randomStartAndEnd(x: number, y: number) {
		const start = randomPointOnGrid(x, y)
		let end: V2
		while (!end) {
			const sample = randomPointOnGrid(x, y)
			if (!v2.equal(sample, start))
				end = sample
		}
		return {start, end}
	}

	function getAdjacentPoints(current: V2, x: number, y: number) {
		const relativeConsiderations: V2[] = [
			[0, 1], // north
			// [1, 1], // north east
			[1, 0], // east
			// [1, -1], // south east
			[0, -1], // south
			// [-1, -1], // south west
			[-1, 0], // west
			// [-1, 1], // north west
		]
		const absoluteConsiderations: V2[] = relativeConsiderations.map(
			point => v2.add(current, point)
		)
		const inBounds = absoluteConsiderations.filter(point => (
			numpty.between(point[0], 0, x + 1) &&
			numpty.between(point[1], 0, y + 1)
		))
		return inBounds
	}

	function randomSelect<T>(stuff: T[]): T {
		const index = Math.floor(random() * stuff.length)
		return stuff[index]
	}

	function alreadyInPath(point: V2, path: V2[]) {
		for (const existingPoint of path) {
			if (v2.equal(point, existingPoint))
				return true
		}
		return false
	}

	function randomPath(x: number, y: number) {
		const {start, end} = randomStartAndEnd(x, y)

		function wander(path: V2[]) {
			const current = path[path.length - 1]
			const adjacent = getAdjacentPoints(current, x, y)
				.filter(point => !alreadyInPath(point, path))

			if (adjacent.length === 0)
				return undefined
	
			if (alreadyInPath(end, adjacent))
				return [...path, end]

			const next = randomSelect(adjacent)
			path.push(next)
			return wander(path)
		}

		let path: V2[]
		while (!path) {
			path = wander([start])
		}
	
		return path
	}

	function openDoorBetween(tileA: Tile, a: V2, b: V2) {
		const diff = v2.subtract(a, b)
	
		if (v2.equal(diff, [0, 1]))
			tileA.doors.north = true
	
		if (v2.equal(diff, [1, 0]))
			tileA.doors.east = true
	
		if (v2.equal(diff, [0, -1]))
			tileA.doors.south = true
	
		if (v2.equal(diff, [-1, 0]))
			tileA.doors.west = true
	}

	function openDoorsAlongPath(grid: AnyGrid, path: V2[]) {
		path.forEach(([x, y], index) => {
			const previousIndex = index - 1
			const nextIndex = index + 1
	
			const previous = previousIndex >= 0
				? path[previousIndex]
				: undefined
	
			const next = nextIndex < path.length
				? path[nextIndex]
				: undefined
	
			const tile = grid[x][y]
			
			if (previous)
				openDoorBetween(tile, [x, y], previous)
	
			if (next)
				openDoorBetween(tile, [x, y], next)
		})
	}

	function generateDungeon(x: number, y: number) {
		const grid = generateGridOfBigTiles(5, 5)
		const path = randomPath(x, y)
		openDoorsAlongPath(grid, path)
		return grid
	}

	return {
		generateDungeon,
	}
}
