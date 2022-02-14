
import {Rando} from "dbmage"
import {parseHashForSessionId} from "sparrow-rtc"
import {render as litRender, TemplateResult} from "lit"

import {Networking} from "./types.js"
import {hostSetup} from "./setups/host-setup.js"
import {clientSetup} from "./setups/client-setup.js"
import {sessionTerm} from "./setups/common/session-term.js"
import {NetSetupOptions} from "./setups/types/net-setup-options.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"
import {makeNetworkingState} from "./setups/common/make-networking-state.js"

export async function makeNetworking({rando, getAccess, networkingPanel, indicatorsDisplay, debugPanel, scoreboard}: {
		rando: Rando
		getAccess: () => AccessPayload
		networkingPanel: HTMLElement
		indicatorsDisplay: HTMLElement
		debugPanel: HTMLElement
		scoreboard: HTMLElement
	}): Promise<Networking> {

	const state = makeNetworkingState()
	state.writable.sessionId = parseHashForSessionId(location.hash, sessionTerm)

	const options: Omit<NetSetupOptions, "receive"> = {
		state,
		rando,
		getAccess,
		writeNetworking: (template: TemplateResult) => litRender(template, networkingPanel),
		writeIndicators: (template: TemplateResult) => litRender(template, indicatorsDisplay),
		writeDebug: (template: TemplateResult) => litRender(template, debugPanel),
		writeScoreboard: (template: TemplateResult) => litRender(template, scoreboard),
	}

	const hostsideReceivers = new Set<(data: any) => void>()
	const clientsideReceivers = new Set<(clientId: string, data: any) => void>()
	const handlersForDisconnectedClients = new Set<(clientId: string) => void>()

	if (state.readable.sessionId) {
		const {playerId, sendToHost} = await clientSetup({
			...options,
			receive(data: any) {
				for (const receiver of hostsideReceivers)
					receiver(data)
			}
		})
		return {
			host: false,
			playerId,
			sendToHost,
			receivers: hostsideReceivers,
		}
	}
	else {
		const {playerId, sendToAllClients} = await hostSetup({
			...options,
			receive(clientId: string, data: any) {
				for (const receiver of clientsideReceivers)
					receiver(clientId, data)
			},
			handleClientDisconnected(clientId) {
				for (const handler of handlersForDisconnectedClients)
					handler(clientId)
			},
		})
		return {
			host: true,
			playerId,
			sendToAllClients,
			handlersForDisconnectedClients,
			receivers: clientsideReceivers,
		}
	}
}
