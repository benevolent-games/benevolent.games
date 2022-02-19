
import {svg, html} from "lit"
import userPlusSvg from "../../../web/icons/feather/user-plus.svg.js"

export function renderInviteButton({sessionId, inviteCopied, invite}: {
		sessionId: string | undefined
		inviteCopied: boolean | "blocked"
		invite: () => void
	}) {
	return sessionId
		? html`
			<button
				class=invite
				data-copied=${inviteCopied}
				title="copy invite link"
				@click=${invite}>
					${svg(userPlusSvg)}
			</button>
		`
		: null
}
