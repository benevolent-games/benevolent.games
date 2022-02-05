
import {sessionLink} from "sparrow-rtc"
import {sessionTerm} from "./session-term.js"
import {debounce} from "@chasemoskal/snapstate"
import {makeNetworkingState} from "./make-networking-state.js"

export function makeInviter(state: ReturnType<typeof makeNetworkingState>) {
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
