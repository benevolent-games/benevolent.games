
import {TemplateResult, html, svg} from "lit"

import {makeInviter} from "./common/make-inviter.js"
import {connectAsHost} from "./connections/connect-as-host.js"
import {makeNetworkingState} from "./common/make-networking-state.js"
import {renderInviteButton} from "./rendering/render-invite-button.js"
import {renderNetIndicator} from "./rendering/render-net-indicator.js"
import {renderLoadingSpinner} from "./rendering/render-loading-spinner.js"

import crownSvg from "../../web/icons/tabler/crown.svg.js"

export async function hostSetup({state, writeNetworking, writeIndicators, writeDebug}: {
		state: ReturnType<typeof makeNetworkingState>
		writeNetworking: (template: TemplateResult) => void
		writeIndicators: (template: TemplateResult) => void
		writeDebug: (template: TemplateResult) => void
	}) {

	const invite = makeInviter(state)

	state.track(({sessionId, inviteCopied, loading}) => writeNetworking(html`
		${renderInviteButton({sessionId, inviteCopied, invite})}
		${renderLoadingSpinner(loading)}
	`))

	state.track(({loading, sessionId}) => writeIndicators(html`
		${sessionId
			? html`
				<div class=hostindicator title="you are the host">
					<span>${svg(crownSvg)}</span>
				</div>
			`
			: null}
		${renderNetIndicator({loading, sessionId})}
	`))

	state.writable.loading = true
	const {hostConnection, sendCloseToAllClients} = await connectAsHost({
		update: ({session, world}) => writeDebug(html`
			<p>session: ${session?.id}</p>
		`),
	})
	window.onbeforeunload = sendCloseToAllClients
	state.writable.sessionId = hostConnection.state.session?.id
	state.writable.loading = false
}
