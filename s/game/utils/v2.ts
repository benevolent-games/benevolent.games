
export type V2 = [number, number]

export function zero(): V2 {
	return [0, 0]
}

export function rotate(x: number, y: number, radians: number): V2 {
	return [
		(x * Math.cos(radians)) - (y * Math.sin(radians)),
		(x * Math.sin(radians)) + (y * Math.cos(radians)),
	]
}

export function dot(a: V2, b: V2): number {
	return (a[0] * b[0]) + (a[1] * b[1])
}

export function distance([x1, y1]: V2, [x2, y2]: V2): number {
	const x = x1 - x2
	const y = y1 - y2
	return Math.sqrt((x * x) + (y * y))
}

export function atan2([ax, ay]: V2, [bx, by]: V2): number {
	return Math.atan2(by, bx) - Math.atan2(ay, ax)
}

export function magnitude([x, y]: V2): number {
	return Math.sqrt(
		x * x +
		y * y
	)
}

export function subtract(a: V2, b: V2): V2 {
	return [
		a[0] - b[0],
		a[1] - b[1],
	]
}

export function normalize(vector: V2): V2 {
	const length = magnitude(vector)
	const [x, y] = vector
	return length === 0
		? vector
		: [
			x / length,
			y / length,
		]
}

export function applyBy(vector: V2, change: (a: number) => number): V2 {
	return [
		change(vector[0]),
		change(vector[1]),
	]
}

export function negate(vector: V2): V2 {
	return applyBy(vector, a => a * -1)
}

export function multiplyBy(vector: V2, factor: number): V2 {
	return applyBy(vector, a => a * factor)
}
