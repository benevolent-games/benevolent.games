
export type V3 = [number, number, number]

export function fromBabylon(vector: BABYLON.Vector3): V3 {
	return [vector.x, vector.y, vector.z]
}

export function toBabylon(v: V3): BABYLON.Vector3 {
	return new BABYLON.Vector3(...v)
}

export function zero(): V3 {
	return [0, 0, 0]
}

export function equal(a: V3, b: V3, ...c: V3[]) {
	const [x, y, z] = a
	for (const d of [b, ...c]) {
		const [x2, y2, z2] = d
		if (x !== x2 || y !== y2 || z !== z2)
			return false
	}
	return true
}

export function add(...vectors: V3[]): V3 {
	let x = 0
	let y = 0
	let z = 0
	for (const [vx, vy, vz] of vectors) {
		x += vx
		y += vy
		z += vz
	}
	return [x, y, z]
}

function applyBy([x, y, z]: V3, action: (a: number) => number): V3 {
	return [
		action(x),
		action(y),
		action(z),
	]
}

export function negate(vector: V3): V3 {
	return applyBy(vector, a => a * -1)
}

export function subtract(a: V3, b: V3): V3 {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2],
	]
}

export function addBy(vector: V3, delta: number): V3 {
	return applyBy(vector, a => a + delta)
}

export function multiplyBy(vector: V3, delta: number): V3 {
	return applyBy(vector, a => a * delta)
}

export function divideBy(vector: V3, delta: number): V3 {
	return applyBy(
		vector,
		a => delta === 0
			? a
			: a / delta
	)
}

export function magnitude([x, y, z]: V3): number {
	return Math.sqrt(
		x * x +
		y * y +
		z * z
	)
}

export function normalize(vector: V3): V3 {
	const length = magnitude(vector)
	const [x, y, z] = vector
	return length === 0
		? vector
		: [
			x / length,
			y / length,
			z / length,
		]
}

export function distance([ax, ay, az]: V3, [bx, by, bz]: V3) {
	return Math.sqrt(
		((ax - bx) ** 2) +
		((ay - by) ** 2) +
		((az - bz) ** 2)
	)
}
