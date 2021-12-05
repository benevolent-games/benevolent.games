
export type V3 = [number, number, number]

export const v3 = {
	add(...vectors: V3[]): V3 {
		let x = 0
		let y = 0
		let z = 0
		for (const [vx, vy, vz] of vectors) {
			x += vx
			y += vy
			z += vz
		}
		return [x, y, z]
	},
}
