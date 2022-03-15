
import {cap as scalarCap} from "./numpty.js"

export type V2 = [number, number]

export function is(v: V2) {
	return v
}

export function zero(): V2 {
	return [0, 0]
}

export function equal(a: V2, b: V2, ...c: V2[]) {
	const [x, y] = a
	for (const d of [b, ...c]) {
		const [x2, y2] = d
		if (x !== x2 || y !== y2)
			return false
	}
	return true
}

export function rotate([x, y]: V2, radians: number): V2 {
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

export function add([x, y]: V2, ...vectors: V2[]): V2 {
	for (const vector of vectors) {
		x += vector[0]
		y += vector[1]
	}
	return [x, y]
}

export function multiply(a: V2, b: V2): V2 {
	return [
		a[0] * b[0],
		a[1] * b[1],
	]
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

export function cap(vector: V2, min: number, max: number) {
	return applyBy(vector, a => scalarCap(a, min, max))
}

export function negate(vector: V2): V2 {
	return applyBy(vector, a => a * -1)
}

export function multiplyBy(vector: V2, factor: number): V2 {
	return applyBy(vector, a => a * factor)
}

export function addBy(vector: V2, amount: number): V2 {
	return applyBy(vector, a => a + amount)
}
