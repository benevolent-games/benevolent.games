
import {Rando} from "dbmage"
import {parseHashForSessionId} from "sparrow-rtc"
import {render as litRender, TemplateResult} from "lit"

import {hostSetup} from "./setups/host-setup.js"
import {clientSetup} from "./setups/client-setup.js"
import {sessionTerm} from "./setups/common/session-term.js"
import {NetSetupOptions} from "./setups/types/net-setup-options.js"
import {makeNetworkingState} from "./setups/common/make-networking-state.js"
import {makeAccessModel} from "xiome/x/features/auth/aspects/users/models/access-model"

export async function makeNetworking({rando, accessModel, networkingPanel, indicatorsDisplay, debugPanel, scoreboard}: {
		rando: Rando
		accessModel: ReturnType<typeof makeAccessModel>
		networkingPanel: HTMLElement
		indicatorsDisplay: HTMLElement
		debugPanel: HTMLElement
		scoreboard: HTMLElement
	}) {

	const state = makeNetworkingState()
	state.writable.sessionId = parseHashForSessionId(location.hash, sessionTerm)
	const options: NetSetupOptions = {
		state,
		rando,
		accessModel,
		writeNetworking: (template: TemplateResult) => litRender(template, networkingPanel),
		writeIndicators: (template: TemplateResult) => litRender(template, indicatorsDisplay),
		writeDebug: (template: TemplateResult) => litRender(template, debugPanel),
		writeScoreboard: (template: TemplateResult) => litRender(template, scoreboard),
	}

	if (state.readable.sessionId)
		await clientSetup(options)
	else
		await hostSetup(options)
}
