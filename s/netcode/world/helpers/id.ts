
const idSize = 8

export function randomId() {
	const palette = [..."0123456789abcdef"]
	const paletteLength = palette.length
	let id = ""
	for (let i = 0; i < idSize; i += 1) {
		const paletteIndex = Math.floor(Math.random() * paletteLength)
		id += palette[paletteIndex]
	}
	return id
}
