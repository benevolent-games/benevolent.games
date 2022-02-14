
import {html} from "lit"

import {makeInviter} from "./common/make-inviter.js"
import {NetSetupOptions} from "./types/net-setup-options.js"
import {renderScoreboard} from "./rendering/render-scoreboard.js"
import {connectAsClient} from "./connections/connect-as-client.js"
import {renderInviteButton} from "./rendering/render-invite-button.js"
import {renderNetIndicator} from "./rendering/render-net-indicator.js"
import {renderLoadingSpinner} from "./rendering/render-loading-spinner.js"

export async function clientSetup({state, receive, getAccess, ...options}: NetSetupOptions) {

	const invite = makeInviter(state)

	state.track(({loading, sessionId, inviteCopied}) => options.writeNetworking(
		html`
			${renderLoadingSpinner(loading)}
			${!loading
				? renderInviteButton({sessionId, inviteCopied, invite})
				: null}
		`
	))

	state.track(({loading, sessionId}) => options.writeIndicators(html`
		${renderNetIndicator({loading, sessionId})}
	`))

	state.track(({sessionId, scoreboard}) => options.writeScoreboard(
		renderScoreboard({sessionId, scoreboard})
	))

	state.writable.loading = true
	const {sendToHost, getPlayerId} = await connectAsClient({
		sessionId: state.readable.sessionId,
		receive,
		getAccess,
		update: data => {
			state.writable.scoreboard = data.scoreboard
		},
	})
	state.writable.loading = false

	return {sendToHost, getPlayerId}
}
