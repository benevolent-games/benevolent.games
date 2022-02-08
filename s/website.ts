
import "./web/xiome.js"

void function introAnimation() {
	const {style} = document.querySelector<HTMLElement>("main > h1 .logo-unit")

	function startAnimation() {
		style.opacity = "0"
		style.transform = "scale(0.5)"
		style.display = "block"
	}

	function endAnimation() {
		style.transition = "all ease 10s"
		style.opacity = "1"
		style.transform = "scale(1)"
	}

	function delay(func) {
		setTimeout(func, 0)
	}

	startAnimation()
	delay(endAnimation)
}()

void function qualityModeSelection() {
	const storageKey = "benevolent-high-quality"
	const gamegrid = document.querySelector(".gamegrid")
	const checkbox = document.querySelector<HTMLInputElement>(".qualitycheckbox")

	function updateGrid() {
		const {checked} = checkbox
		gamegrid.setAttribute("data-high-quality", checked ? "true" : "false")
	}

	checkbox.oninput = () => {
		const setting = checkbox.checked
			? "true"
			: "false"
		localStorage.setItem(storageKey, setting)
		updateGrid()
	}

	const recollection = localStorage.getItem(storageKey) ?? "false"
	checkbox.checked = recollection === "true"
		? true
		: false
	updateGrid()
}()
