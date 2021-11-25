
export function makeFramerateDisplay({element, getFramerate}: {
		element: HTMLElement
		getFramerate: () => number
	}) {

	function updateFramerateDisplay() {
		const rate = getFramerate()
		const fixed = rate.toFixed(0)
		element.textContent = fixed.length === 1
			? "0" + fixed
			: fixed
	}

	setInterval(updateFramerateDisplay, 100)
}
