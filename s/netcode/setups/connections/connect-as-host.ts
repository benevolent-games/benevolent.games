
import {createSessionAsHost, pub, JoinerControls} from "sparrow-rtc"

import {rtcOptions} from "../common/rtc-options.js"
import {AuthedUser, GuestUser, Scoreboard} from "../types/world.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"
import {MessageFromClient, MessageFromHost} from "../types/messages.js"

interface Client {
	controls: JoinerControls
	clientTime: number
	lastTime: number
	messageId: number
	ping: number
	guest: GuestUser
	user?: AuthedUser
	pingWaiters: {id: number, start: number}[]
}

export async function connectAsHost({generateNickname, getAccess, update}: {
		generateNickname: () => string
		getAccess: () => AccessPayload
		update: ({}: {sessionId: string, scoreboard: Scoreboard}) => void
	}) {
	const clients = new Set<Client>()
	const closeEvent = pub()

	const hostConnection = await createSessionAsHost({
		label: "game",
		rtcConfig: rtcOptions.rtcConfig,
		signalServerUrl: rtcOptions.signalServerUrl,
		onStateChange() {},
		handleJoin(controls) {
			const client: Client = {
				controls,
				clientTime: 0,
				lastTime: Date.now(),
				messageId: 0,
				ping: 0,
				guest: {nickname: generateNickname()},
				user: undefined,
				pingWaiters: [],
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
					const {id, user} = <MessageFromClient>JSON.parse(<string>message)
					const waiter = client.pingWaiters.find(w => w.id === id)
					if (waiter) {
						const ping = Date.now() - waiter.start
						client.ping = ping
						client.user = user
					}
				},
			}
		},
	})

	const runtimeStart = Date.now()
	const hostGuest: GuestUser = {
		nickname: generateNickname(),
	}

	const heartbeatRepeater = (() => {
		function calculateScoreboard(): Scoreboard {
			const hostAccess = getAccess()
			const now = Date.now()
			return {
				runtime: now - runtimeStart,
				players: [
					{
						clientId: "host",
						host: true,
						guest: hostGuest,
						lag: 0,
						ping: 0,
						user: hostAccess?.user?.profile
							? {
								userId: hostAccess.user.userId,
								profile: hostAccess.user.profile,
							}
							: undefined
					},
					...Array.from(clients).map(client => ({
						clientId: client.controls.clientId,
						host: false,
						lag: now - client.lastTime,
						ping: client.ping,
						guest: client.guest,
						user: client.user,
					}))
				],
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

		function sendScoreboardToEveryClient(scoreboard: Scoreboard) {
			for (const client of clients) {
				const id = client.messageId++
				client.pingWaiters.push({id, start: Date.now()})
				if (client.pingWaiters.length > 10) {
					client.pingWaiters = client.pingWaiters.slice(-10)
				}
				const message: MessageFromHost = {
					id,
					scoreboard,
				}
				client.controls.send(JSON.stringify(message))
			}
		}

		return () => {
			cullTimedOutClients()
			const scoreboard = calculateScoreboard()
			update({scoreboard, sessionId: hostConnection.state.session?.id})
			sendScoreboardToEveryClient(scoreboard)
		}
	})()

	setInterval(heartbeatRepeater, rtcOptions.heartbeatPeriod)

	return {
		hostConnection,
		sendCloseToAllClients: () => closeEvent.publish(),
	}
}
