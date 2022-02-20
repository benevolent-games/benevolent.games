
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
