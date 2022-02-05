
import {svg, html} from "lit"
import wifiSvg from "../../../web/icons/feather/wifi.svg.js"
import wifiOffSvg from "../../../web/icons/feather/wifi-off.svg.js"

export function renderNetIndicator({sessionId, loading}: {
		sessionId: string | undefined
		loading: boolean
	}) {
	return html`
		<div class=net>
			${!loading && sessionId
				? html`<span title="multiplayer connected">${svg(wifiSvg)}</span>`
				: html`<span title="not connected">${svg(wifiOffSvg)}</span>`}
		</div>
	`
}
