import {EntityDescription} from "../game/types.js"
import {Changes} from "./world/types.js"

export interface HostNetworking {
	host: true
	getPlayerId(): string
	sendToAllClients(data: any): void
	receivers: Set<(data: any) => void>
}

export interface ClientNetworking {
	host: false
	getPlayerId(): string
	sendToHost(data: any): void
	receivers: Set<(data: any) => void>
}

export type Networking = HostNetworking | ClientNetworking

//
// coordinator types
//

export enum UpdateType {
	Description,
	Changes,
	Request,
}

export type DescriptionUpdate = [
	UpdateType.Description,
	[string, EntityDescription],
]

export type ChangesUpdate = [
	UpdateType.Changes,
	Changes<EntityDescription>,
]

export type RequestUpdate = [
	UpdateType.Request,
	any,
]

export type Update = DescriptionUpdate | ChangesUpdate | RequestUpdate
