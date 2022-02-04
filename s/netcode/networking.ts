
import {getRando, Rando} from "dbmage"
import {debounce, nap, snapstate} from "@chasemoskal/snapstate"
import {sessionLink, parseHashForSessionId} from "sparrow-rtc"
import {render as litRender, svg, html, TemplateResult} from "lit"

import loaderSvg from "../web/icons/loader.svg.js"
import wifiSvg from "../web/icons/wifi.svg.js"
import wifiOffSvg from "../web/icons/wifi-off.svg.js"
import powerSvg from "../web/icons/power.svg.js"
import userPlusSvg from "../web/icons/user-plus.svg.js"
import crownSvg from "../web/icons/crown.svg.js"

const sessionTerm = "join"

export async function makeNetworking({networkingPanel}: {
		networkingPanel: HTMLElement
	}) {

	const rando = await getRando()
	const write = (template: TemplateResult) => litRender(template, networkingPanel)

	const state = makeNetworkingState()
	state.writable.sessionId = parseHashForSessionId(location.hash, sessionTerm)
	if (state.readable.sessionId)
		initializeClientSession({state, write})
	else
		initializeHostSession({rando, state, write})
}

function makeNetworkingState() {
	return snapstate({
		host: false,
		sessionId: undefined as string | undefined,
		loading: false,
		inviteCopied: false,
	})
}

function initializeHostSession({rando, state, write}: {
		rando: Rando
		state: ReturnType<typeof makeNetworkingState>
		write: (template: TemplateResult) => void
	}) {
	const {readable, writable} = state
	async function startHosting() {
		writable.loading = true
		await nap(1000)
		writable.sessionId = rando.randomId().toString()
		writable.loading = false
	}
	const invite = makeInviter(state)
	function render() {
		write(html`
			${renderNetIndicator(readable)}
			${readable.sessionId
				? html`<div class=hostindicator title="you are the host"><span>${svg(crownSvg)}</span></div>`
				: null}
			${renderLoadingSpinner(readable.loading)}
			${readable.sessionId
				? renderInviteButton({readable, invite})
				: !readable.loading
					? html`
						<button class=starthosting title="host multiplayer game" @click=${startHosting}>
							${svg(powerSvg)}
						</button>
					`
					: null}
		`)
	}
	render()
	state.subscribe(render)
}

function initializeClientSession({state, write}: {
		state: ReturnType<typeof makeNetworkingState>
		write: (template: TemplateResult) => void
	}) {
	const {readable} = state
	const invite = makeInviter(state)
	function render() {
		write(html`
			${renderNetIndicator(readable)}
			${renderLoadingSpinner(readable.loading)}
			${renderInviteButton({readable, invite})}
		`)
	}
	render()
	state.subscribe(render)
}

function makeInviter(state: ReturnType<typeof makeNetworkingState>) {
	const hideInviteCopiedIndicator = debounce(1000, () => {
		state.writable.inviteCopied = false
	})
	return function() {
		const {sessionId} = state.readable
		state.writable.inviteCopied = true
		const link = sessionLink(location.href, sessionTerm, sessionId)
		navigator.clipboard.writeText(link)
		hideInviteCopiedIndicator()
	}
}

function renderLoadingSpinner(loading: boolean) {
	return loading
		? html`<div class=busy><span>${svg(loaderSvg)}</span></div>`
		: null
}

function renderNetIndicator(readable: ReturnType<typeof makeNetworkingState>["readable"]) {
	const {sessionId} = readable
	return html`
		<div class=net>
			${sessionId
				? html`<span title="connected">${svg(wifiSvg)}</span>`
				: html`<span title="not connected">${svg(wifiOffSvg)}</span>`}
		</div>
	`
}

function renderInviteButton({readable, invite}: {
		invite: () => void
		readable: ReturnType<typeof makeNetworkingState>["readable"]
	}) {
	const {sessionId, inviteCopied} = readable
	return sessionId
		? html`
			<button class=invite ?data-copied=${inviteCopied} title="copy invite link" @click=${invite}>
				${svg(userPlusSvg)}
			</button>
		`
		: null
}
