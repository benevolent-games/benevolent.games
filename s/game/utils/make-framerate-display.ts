
export function makeFramerateDisplay({getFramerate}: {
		getFramerate: () => number
	}) {

	const element = document.createElement("p")
	element.className = "framerate"
	element.textContent = "-"

	setInterval(
		() => element.textContent = getFramerate().toFixed(0),
		100
	)

	return element
}
