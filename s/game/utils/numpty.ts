
export function min(value: number, min: number) {
	return value < min
		? min
		: value
}

export function max(value: number, max: number) {
	return value > max
		? max
		: value
}

export function cap(value: number, min: number, max: number) {
	return value < min
		? min
		: value > max
			? max
			: value
}

export function between(value: number, min: number, max: number) {
	const space = max - min
	const amount = value - min
	return amount / space
}
