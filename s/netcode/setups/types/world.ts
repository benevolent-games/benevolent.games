
export interface World {
	hostTime: number
	clients: {clientId: string, clientTime: number}[]
}
