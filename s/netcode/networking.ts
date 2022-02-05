
import {getRando, Rando} from "dbmage"
import {sessionLink, parseHashForSessionId} from "sparrow-rtc"
import {debounce, nap, snapstate} from "@chasemoskal/snapstate"
import {render as litRender, svg, html, TemplateResult} from "lit"

import loaderSvg from "../web/icons/feather/loader.svg.js"
import wifiSvg from "../web/icons/feather/wifi.svg.js"
import wifiOffSvg from "../web/icons/feather/wifi-off.svg.js"
import userPlusSvg from "../web/icons/feather/user-plus.svg.js"
import crownSvg from "../web/icons/tabler/crown.svg.js"

const sessionTerm = "join"

export async function makeNetworking({networkingPanel, indicatorsDisplay}: {
		networkingPanel: HTMLElement
		indicatorsDisplay: HTMLElement
	}) {

	const rando = await getRando()
	const writeNetworking = (template: TemplateResult) => litRender(template, networkingPanel)
	const writeIndicators = (template: TemplateResult) => litRender(template, indicatorsDisplay)

	const state = makeNetworkingState()
	state.writable.sessionId = parseHashForSessionId(location.hash, sessionTerm)
	if (state.readable.sessionId)
		await initializeClientSession({state, writeNetworking, writeIndicators})
	else
		await initializeHostSession({rando, state, writeNetworking, writeIndicators})
}

function makeNetworkingState() {
	return snapstate({
		host: false,
		sessionId: undefined as string | undefined,
		loading: false,
		inviteCopied: false,
	})
}

async function initializeHostSession({rando, state, writeNetworking, writeIndicators}: {
		rando: Rando
		state: ReturnType<typeof makeNetworkingState>
		writeNetworking: (template: TemplateResult) => void
		writeIndicators: (template: TemplateResult) => void
	}) {

	async function startHosting() {
		state.writable.loading = true
		await nap(1000)
		state.writable.sessionId = rando.randomId().toString()
		state.writable.loading = false
	}
	startHosting()

	const invite = makeInviter(state)

	state.track(({sessionId, inviteCopied, loading}) => writeNetworking(html`
		${renderInviteButton({sessionId, inviteCopied, invite})}
		${renderLoadingSpinner(loading)}
	`))

	state.track(({loading, sessionId}) => writeIndicators(html`
		${sessionId
			? html`<div class=hostindicator title="you are the host"><span>${svg(crownSvg)}</span></div>`
			: null}
		${renderNetIndicator({loading, sessionId})}
	`))
}

async function initializeClientSession({state, writeNetworking, writeIndicators}: {
		state: ReturnType<typeof makeNetworkingState>
		writeNetworking: (template: TemplateResult) => void
		writeIndicators: (template: TemplateResult) => void
	}) {

	state.writable.loading = true
	setTimeout(() => {
		state.writable.loading = false
	}, 2000)

	const invite = makeInviter(state)

	state.track(({loading, sessionId, inviteCopied}) => writeNetworking(html`
		${renderLoadingSpinner(loading)}
		${!loading
			? renderInviteButton({sessionId, inviteCopied, invite})
			: null}
	`))

	state.track(({loading, sessionId}) => writeIndicators(html`
		${renderNetIndicator({loading, sessionId})}
	`))
}

function makeInviter(state: ReturnType<typeof makeNetworkingState>) {
	const hideInviteCopiedIndicator = debounce(2000, () => {
		state.writable.inviteCopied = false
	})
	return function() {
		const {sessionId} = state.readable
		state.writable.inviteCopied = true
		const link = sessionLink(location.href, sessionTerm, sessionId)
		console.log(link)
		navigator.clipboard.writeText(link)
		hideInviteCopiedIndicator()
	}
}

function renderLoadingSpinner(loading: boolean) {
	return loading
		? html`<div class=busy><span>${svg(loaderSvg)}</span></div>`
		: null
}

function renderNetIndicator({sessionId, loading}: {
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

function renderInviteButton({sessionId, inviteCopied, invite}: {
		sessionId: string | undefined
		inviteCopied: boolean
		invite: () => void
	}) {
	return sessionId
		? html`
			<button
				class=invite
				?data-copied=${inviteCopied}
				title="copy invite link"
				@click=${invite}>
					${svg(userPlusSvg)}
			</button>
		`
		: null
}
