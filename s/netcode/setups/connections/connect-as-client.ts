
import {Scoreboard} from "../types/world.js"
import {rtcOptions} from "../common/rtc-options.js"
import {joinSessionAsClient, standardRtcConfig} from "sparrow-rtc"
import {Datagram, DatagramPurpose, MessageFromClient, MessageFromHost} from "../types/messages.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

export async function connectAsClient({
		sessionId,
		receive,
		getAccess,
		update,
	}: {
		sessionId: string
		receive: (data: any) => void
		getAccess: () => AccessPayload
		update: ({}: {sessionId: string, scoreboard: Scoreboard}) => void
	}) {

	const {controls} = await joinSessionAsClient({
		sessionId,
		signalServerUrl: rtcOptions.signalServerUrl,
		rtcConfig: standardRtcConfig,
		onStateChange() {},
		handleJoin({send, close}) {
			let lastCommunication = Date.now()
			return {
				handleClose() {},
				handleMessage(incoming) {
					const [purpose, data] = <Datagram>JSON.parse(<string>incoming)
					if (purpose === DatagramPurpose.Bookkeeping) {
						lastCommunication = Date.now()
						const {id, scoreboard} = <MessageFromHost>data
						const user = getAccess()?.user
						const response: MessageFromClient = {
							id,
							user: user
								? {
									userId: user.userId,
									profile: user.profile,
								}
								: undefined
						}
						send(JSON.stringify(<Datagram>[
							DatagramPurpose.Bookkeeping,
							response,
						]))
						update({sessionId, scoreboard})
					}
					else {
						receive(data)
					}
				},
			}
		},
	})

	window.onbeforeunload = controls.close

	return {
		playerId: controls.clientId,
		sendToHost(data: any) {
			const datagram: Datagram = [
				DatagramPurpose.App,
				data,
			]
			controls.send(JSON.stringify(datagram))
		},
	}
}
