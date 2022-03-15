
export type Random = () => number

export function randomSeed() {
	return Math.floor(Math.random() * 1_000_000_000)
}

export interface RandomTools {
	random(): number
	randomSelect<T>(stuff: T[]): T
	randomBoolean(percentChanceOfTrue: number): boolean
}

export function pseudoRandomTools(seed: number): RandomTools {

	function random() {
		seed = Math.imul(48271, seed) | 0 % 2147483647
		return (seed & 2147483647) / 2147483648
	}

	random() // discard first value

	return {
		random,
		randomSelect(stuff) {
			const index = Math.floor(random() * stuff.length)
			return stuff[index]
		},
		randomBoolean(percentChanceOfTrue) {
			return random() < (percentChanceOfTrue / 100)
		},
	}
}
