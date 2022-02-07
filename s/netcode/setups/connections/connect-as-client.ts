
import {World} from "../types/world.js"
import {rtcOptions} from "../common/rtc-options.js"
import {joinSessionAsClient, standardRtcConfig} from "sparrow-rtc"

export async function connectAsClient({
		sessionId,
		update,
	}: {
		sessionId: string
		update: ({}: {sessionId: string, world: World}) => void
	}) {

	let outerClose = () => {}
	window.onbeforeunload = outerClose

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
					const world = <World>JSON.parse(<string>message)
					update({sessionId, world})
				},
			}
		},
	})
}
