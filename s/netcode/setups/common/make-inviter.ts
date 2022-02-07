
import {sessionLink} from "sparrow-rtc"
import {sessionTerm} from "./session-term.js"
import {debounce} from "@chasemoskal/snapstate"
import {makeNetworkingState} from "./make-networking-state.js"

export function makeInviter(state: ReturnType<typeof makeNetworkingState>) {
	const hideInviteCopiedIndicator = debounce(2000, () => {
		state.writable.inviteCopied = false
	})
	return async function() {
		const {sessionId} = state.readable
		const link = sessionLink(location.href, sessionTerm, sessionId)
		console.log("invite link", link)

		async function attemptCopy(text: string) {
			try {
				await navigator.clipboard.writeText(text)
				state.writable.inviteCopied = true
			}
			finally {
				hideInviteCopiedIndicator()
			}
		}

		if (navigator.permissions) {
			const permission = "clipboard-write" as PermissionName
			const result = await navigator.permissions.query({name: permission})
			if (result.state == "granted" || result.state == "prompt")
				attemptCopy(link)
		}
		else
			attemptCopy(link)
	}
}
