
import {html, svg} from "lit"
import {standardNicknameGenerator} from "xiome/x/features/auth/utils/nicknames/standard-nickname-generator.js"

import {makeInviter} from "./common/make-inviter.js"
import {NetSetupOptions} from "./types/net-setup-options.js"
import {connectAsHost} from "./connections/connect-as-host.js"
import {renderScoreboard} from "./rendering/render-scoreboard.js"
import {renderInviteButton} from "./rendering/render-invite-button.js"
import {renderNetIndicator} from "./rendering/render-net-indicator.js"
import {renderLoadingSpinner} from "./rendering/render-loading-spinner.js"

import crownSvg from "../../web/icons/tabler/crown.svg.js"

export async function hostSetup({
		state, rando, receive, getAccess, handleClientDisconnected, ...options
	}: NetSetupOptions & {
		receive: (clientId: string, data: any) => void
		handleClientDisconnected: (clientId: string) => void
	}) {

	const generateNickname = standardNicknameGenerator({rando: <any>rando})
	const invite = makeInviter(state)

	state.track(({sessionId, inviteCopied, loading}) => options.writeNetworking(html`
		${renderInviteButton({sessionId, inviteCopied, invite})}
		${renderLoadingSpinner(loading)}
	`))

	state.track(({loading, sessionId}) => options.writeIndicators(html`
		${sessionId
			? html`
				<div class=hostindicator title="you are the host">
					<span>${svg(crownSvg)}</span>
				</div>
			`
			: null}
		${renderNetIndicator({loading, sessionId})}
	`))

	state.track(({sessionId, scoreboard}) => options.writeScoreboard(
		renderScoreboard({sessionId, scoreboard})
	))

	state.writable.loading = true
	const {hostConnection, playerId, sendToAllClients, sendCloseToAllClients} = await connectAsHost({
		receive,
		generateNickname,
		getAccess,
		update: data => {
			state.writable.scoreboard = data.scoreboard
		},
		handleClientDisconnected,
	})
	window.onbeforeunload = sendCloseToAllClients
	state.writable.sessionId = hostConnection.state.session?.id
	state.writable.loading = false

	return {
		playerId,
		sendToAllClients,
	}
}
