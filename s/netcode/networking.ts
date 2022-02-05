
import {getRando} from "dbmage"
import {parseHashForSessionId} from "sparrow-rtc"
import {render as litRender, TemplateResult} from "lit"

import {sessionTerm} from "./setups/common/session-term.js"
import {makeNetworkingState} from "./setups/common/make-networking-state.js"
import {hostSetup} from "./setups/host-setup.js"
import {clientSetup} from "./setups/client-setup.js"

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
		await clientSetup({state, writeNetworking, writeIndicators})
	else
		await hostSetup({rando, state, writeNetworking, writeIndicators})
}
