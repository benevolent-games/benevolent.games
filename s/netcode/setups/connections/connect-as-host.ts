
import {createSessionAsHost} from "sparrow-rtc"
import {pub} from "sparrow-rtc/x/toolbox/pub.js"
import {JoinerControls} from "sparrow-rtc/x/types.js"

import {World} from "../types/world.js"
import {rtcOptions} from "../common/rtc-options.js"

interface Client {
	controls: JoinerControls
	clientTime: number
	lastTime: number
}

export async function connectAsHost() {
	const clients = new Set<Client>()
	const closeEvent = pub()

	const hostConnection = await createSessionAsHost({
		label: "game",
		rtcConfig: rtcOptions.rtcConfig,
		signalServerUrl: rtcOptions.signalServerUrl,
		handleJoin(controls) {
			const client: Client = {
				controls,
				clientTime: 0,
				lastTime: Date.now(),
			}
			clients.add(client)
			const unsubscribeCloseListener = closeEvent.subscribe(controls.close)
			return {
				handleClose() {
					clients.delete(client)
					unsubscribeCloseListener()
				},
				handleMessage(message) {
					client.lastTime = Date.now()
					const {clientTime} = JSON.parse(<string>message)
					if (typeof clientTime !== "number")
						throw new Error("clientTime failed validation")
					client.clientTime = clientTime
				},
			}
		},
		onStateChange({session}) {},
	})

	const heartbeatRepeater = (() => {
		function calculateWorld(): World {
			return {
				hostTime: Date.now(),
				clients: Array.from(clients).map(client => ({
					clientId: client.controls.clientId,
					clientTime: client.clientTime,
				})),
			}
		}

		function cullTimedOutClients() {
			const timedOutClients: Client[] = []
			for (const client of clients) {
				const timeSinceLastMessage = Date.now() - client.lastTime
				if (timeSinceLastMessage > rtcOptions.timeout) {
					timedOutClients.push(client)
				}
			}
			for (const client of timedOutClients) {
				console.log(`client timed out ${client.controls.clientId}`)
				client.controls.close()
				clients.delete(client)
			}
		}

		function sendWorldToEveryClient(world: World) {
			for (const client of clients)
				client.controls.send(JSON.stringify(world))
		}

		return () => {
			cullTimedOutClients()
			const world = calculateWorld()
			sendWorldToEveryClient(world)
		}
	})()

	setInterval(heartbeatRepeater, rtcOptions.heartbeatPeriod)

	return {
		hostConnection,
		sendCloseToAllClients: () => closeEvent.publish(),
	}
}
