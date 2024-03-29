
import {createSessionAsHost, pub, JoinerControls} from "sparrow-rtc"

import {rtcOptions} from "../common/rtc-options.js"
import {AuthedUser, GuestUser, Scoreboard} from "../types/world.js"
import {Datagram, DatagramPurpose, MessageFromClient, MessageFromHost} from "../types/messages.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

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

export async function connectAsHost({
		generateNickname, getAccess, update, receive, handleClientDisconnected,
	}: {
		generateNickname: () => string
		getAccess: () => AccessPayload
		update: ({}: {sessionId: string, scoreboard: Scoreboard}) => void
		receive(clientId: string, data: any): void
		handleClientDisconnected(clientId: string): void
	}) {

	const clients = new Set<Client>()
	const closeEvent = pub()
	const playerId = "host"

	function registerClientDisconnected(client: Client) {
		clients.delete(client)
		handleClientDisconnected(client.controls.clientId)
	}

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
					registerClientDisconnected(client)
					unsubscribeCloseListener()
				},
				handleMessage(incoming) {
					const [purpose, data] = <Datagram>JSON.parse(<string>incoming)
					if (purpose === DatagramPurpose.Bookkeeping) {
						client.lastTime = Date.now()
						const {id, user} = <MessageFromClient>data
						const waiter = client.pingWaiters.find(w => w.id === id)
						if (waiter) {
							const ping = Date.now() - waiter.start
							client.ping = ping
							client.user = user
						}
					}
					else {
						receive(controls.clientId, data)
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
						clientId: playerId,
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
				registerClientDisconnected(client)
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
				client.controls.send(JSON.stringify(<Datagram>[
					DatagramPurpose.Bookkeeping,
					message,
				]))
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
		playerId,
		sendToAllClients(data: string) {
			const datagram: Datagram = [
				DatagramPurpose.App,
				data,
			]
			const serialized = JSON.stringify(datagram)
			for (const client of clients) {
				client.controls.send(serialized)
			}
		},
		sendCloseToAllClients: () => closeEvent.publish(),
	}
}
