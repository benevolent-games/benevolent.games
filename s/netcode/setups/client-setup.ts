
import {TemplateResult, html} from "lit"

import {makeInviter} from "./common/make-inviter.js"
import {makeNetworkingState} from "./common/make-networking-state.js"
import {renderInviteButton} from "./rendering/render-invite-button.js"
import {renderLoadingSpinner} from "./rendering/render-loading-spinner.js"
import {renderNetIndicator} from "./rendering/render-net-indicator.js"

export async function clientSetup({state, writeNetworking, writeIndicators}: {
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
