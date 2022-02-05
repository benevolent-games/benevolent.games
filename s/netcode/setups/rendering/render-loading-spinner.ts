
import {svg, html} from "lit"
import loaderSvg from "../../../web/icons/feather/loader.svg.js"

export function renderLoadingSpinner(loading: boolean) {
	return loading
		? html`<div class=busy><span>${svg(loaderSvg)}</span></div>`
		: null
}
