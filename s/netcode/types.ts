
export interface HostNetworking {
	host: true
	sendToAllClients(data: any): void
	receivers: Set<(data: any) => void>
}

export interface ClientNetworking {
	host: false
	sendToHost(data: any): void
	receivers: Set<(data: any) => void>
}

export type Networking = HostNetworking | ClientNetworking
