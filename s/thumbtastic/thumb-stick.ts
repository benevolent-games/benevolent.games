
import {LitElement, html, css} from "lit"

export class ThumbStick extends LitElement {

	static styles = css`
	:host {
		display: block;
	}
	.base {
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--thumb-stick-background, #000);
		border-radius: 100%;
	}
	.stick, .understick {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: var(--thumb-stick-size, 66%);
		height: var(--thumb-stick-size, 66%);
		border-radius: 999em;
		background: var(--thumb-stick-color, #fff);
		margin: auto;
		pointer-events: none;
	}
	.understick {
		opacity: 0.5;
	}
	`

	values: {x: number, y: number} = {x: 0, y: 0}
	onstickmove = (values: {x: number, y: number}) => {}

	firstUpdated() {
		const base = this.shadowRoot.querySelector<HTMLElement>(".base")
		const stick = this.shadowRoot.querySelector<HTMLElement>(".stick")
		const understick = this.shadowRoot.querySelector<HTMLElement>(".understick")

		const rect = base.getBoundingClientRect()
		const radius = (rect.width / 2) - (stick.getBoundingClientRect().width / 4)

		function withinRadius(x: number, y: number) {
			return (x ** 2) + (y ** 2) < (radius ** 2)
		}

		function findClosestPointOnCircle(x: number, y: number) {
			const mag = Math.sqrt((x ** 2) + (y ** 2))
			return [
				x / mag * radius,
				y / mag * radius,
			]
		}

		const registerFinalValues = (x: number, y: number) => {
			const values = {
				x: x / radius,
				y: -(y / radius),
			}
			this.values = values
			this.onstickmove(values)
			stick.style.transform = `translate(${x}px, ${y}px)`

			const underX = x * 0.5
			const underY = y * 0.5
			understick.style.transform = `translate(${underX}px, ${underY}px)`
		}

		function moveStick(clientX: number, clientY: number) {
			const {left, top, height, width} = rect
			const middleX = left + (width / 2)
			const middleY = top + (height / 2)
			let x = clientX - middleX
			let y = clientY - middleY
			if (!withinRadius(x, y)) {
				[x, y] = findClosestPointOnCircle(x, y)
			}
			registerFinalValues(x, y)
		}

		function resetStick() {
			registerFinalValues(0, 0)
		}

		let trackingMouse = false

		base.addEventListener("mousedown", ({clientX, clientY}: MouseEvent) => {
			trackingMouse = true
			moveStick(clientX, clientY)
		})

		window.addEventListener("mouseup", () => {
			trackingMouse = false
			resetStick()
		})

		window.addEventListener("mousemove", ({clientX, clientY}: MouseEvent) => {
			if (trackingMouse)
				moveStick(clientX, clientY)
		})

		base.addEventListener("touchstart", (event: TouchEvent) => {
			const {clientX, clientY} = event.touches[0]
			moveStick(clientX, clientY)
			event.preventDefault()
		})

		base.addEventListener("touchmove", (event: TouchEvent) => {
			const {clientX, clientY} = event.touches[0]
			moveStick(clientX, clientY)
			event.preventDefault()
		})

		base.addEventListener("touchend", () => {
			resetStick()
		})
	}

	render() {
		return html`
			<div class=base>
				<div class=stick></div>
				<div class=understick></div>
			</div>
		`
	}
}
