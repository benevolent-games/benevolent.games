
import {snapstate} from "@chasemoskal/snapstate"

export function makeNetworkingState() {
	return snapstate({
		host: false,
		sessionId: undefined as string | undefined,
		loading: false,
		inviteCopied: false,
	})
}
