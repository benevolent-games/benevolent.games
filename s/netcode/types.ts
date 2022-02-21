import {EntityDescription} from "../game/types.js"
import {Changes} from "./world/types.js"

export interface HostNetworking {
	host: true
	playerId: string
	sendToAllClients(data: any): void
	receivers: Set<(clientId: string, data: any) => void>
	handlersForDisconnectedClients: Set<(clientId: string) => void>
}

export interface ClientNetworking {
	host: false
	playerId: string
	sendToHost(data: any): void
	receivers: Set<(data: any) => void>
}

export type Networking = HostNetworking | ClientNetworking

//
// coordinator types
//

export interface MemoOutgoing {
	entityId: string
	memo: any
}

export interface MemoIncoming extends MemoOutgoing {
	playerId: string
}

export enum UpdateType {
	Description,
	Changes,
	Request,
	Memo,
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

export type MemoUpdate = [
	UpdateType.Memo,

	// entityId, memo
	[string, any][],
]

export type Update =
	| DescriptionUpdate
	| ChangesUpdate
	| RequestUpdate
	| MemoUpdate
