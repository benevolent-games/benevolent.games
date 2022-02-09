
import {Scoreboard} from "../types/world.js"
import {rtcOptions} from "../common/rtc-options.js"
import {joinSessionAsClient, standardRtcConfig} from "sparrow-rtc"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens"
import {MessageFromClient, MessageFromHost} from "../types/messages.js"

export async function connectAsClient({
		sessionId,
		getAccess,
		update,
	}: {
		sessionId: string
		getAccess: () => AccessPayload
		update: ({}: {sessionId: string, scoreboard: Scoreboard}) => void
	}) {

	let outerClose = () => {}
	window.onbeforeunload = outerClose

	// TODO implement responding to pings with user info

	await joinSessionAsClient({
		sessionId,
		signalServerUrl: rtcOptions.signalServerUrl,
		rtcConfig: standardRtcConfig,
		onStateChange() {},
		handleJoin({send, close}) {
			outerClose = close
			let lastCommunication = Date.now()
			const interval = setInterval(() => {
				const timeSinceLastCommunication = Date.now() - lastCommunication
				if (timeSinceLastCommunication > rtcOptions.timeout) {
					console.log("host timed out")
					close()
				}
				else {
					const update = JSON.stringify({clientTime: Date.now()})
					send(update)
				}
			}, rtcOptions.heartbeatPeriod)
			return {
				handleClose() {
					clearInterval(interval)
				},
				handleMessage(message) {
					lastCommunication = Date.now()
					const {id, scoreboard} = <MessageFromHost>JSON.parse(<string>message)
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
					send(JSON.stringify(response))
					update({sessionId, scoreboard})
				},
			}
		},
	})
}
