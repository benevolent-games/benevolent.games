
export function makeFramerateDisplay({getFramerate}: {
		getFramerate: () => number
	}) {

	const element = document.createElement("div")
	element.className = "framerate"
	element.textContent = "---"

	setInterval(
		() => element.innerHTML = getFramerate()
			.toFixed(0)
			.padStart(3, "X")
			.replaceAll("X", "&nbsp;"),
		100,
	)

	return element
}
