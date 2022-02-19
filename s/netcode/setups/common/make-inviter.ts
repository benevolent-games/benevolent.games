
import {sessionLink} from "sparrow-rtc"
import {debounce} from "@chasemoskal/snapstate"

import {sessionTerm} from "./session-term.js"
import {makeNetworkingState} from "./make-networking-state.js"

export function makeInviter(state: ReturnType<typeof makeNetworkingState>) {
	const hideInviteCopiedIndicator = debounce(2000, () => {
		state.writable.inviteCopied = false
	})
	return async function() {
		const {sessionId} = state.readable
		const link = sessionLink(location.href, sessionTerm, sessionId)

		try {
			const permission = "clipboard-write" as PermissionName
			const result = await navigator.permissions.query({name: permission})
			if (result.state === "granted" || result.state === "prompt") {
				await navigator.clipboard.writeText(link)
				state.writable.inviteCopied = true
			}
			else
				throw new Error("modern copy rejected")
		}
		catch (error) {
			state.writable.inviteCopied = "blocked"
			const copied = legacyCopyToClipboard(link)
			if (copied)
				state.writable.inviteCopied = true
		}
		finally {
			hideInviteCopiedIndicator()
		}
	}
}

function legacyCopyToClipboard(text: string) {
	try {
		const textarea = document.createElement("textarea")
		textarea.value = text
		textarea.style.top = "0"
		textarea.style.left = "0"
		textarea.style.position = "fixed"
		textarea.style.visibility = "hidden"
		document.body.appendChild(textarea)
		textarea.focus()
		textarea.select()
		return document.execCommand("copy")
	}
	finally {
		return false
	}
}
