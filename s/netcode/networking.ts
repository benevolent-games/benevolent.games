
import {parseHashForSessionId} from "sparrow-rtc"
import {render as litRender, TemplateResult} from "lit"

import {hostSetup} from "./setups/host-setup.js"
import {clientSetup} from "./setups/client-setup.js"
import {sessionTerm} from "./setups/common/session-term.js"
import {makeNetworkingState} from "./setups/common/make-networking-state.js"

export async function makeNetworking({networkingPanel, indicatorsDisplay, debugPanel}: {
		networkingPanel: HTMLElement
		indicatorsDisplay: HTMLElement
		debugPanel: HTMLElement
	}) {

	const writeNetworking = (template: TemplateResult) => litRender(template, networkingPanel)
	const writeIndicators = (template: TemplateResult) => litRender(template, indicatorsDisplay)
	const writeDebug = (template: TemplateResult) => litRender(template, debugPanel)

	const state = makeNetworkingState()
	state.writable.sessionId = parseHashForSessionId(location.hash, sessionTerm)
	const options = {state, writeNetworking, writeIndicators, writeDebug}
	if (state.readable.sessionId)
		await clientSetup(options)
	else
		await hostSetup(options)
}
