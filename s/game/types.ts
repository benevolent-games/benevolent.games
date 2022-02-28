
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

import {V2} from "./utils/v2.js"
import {Quat} from "./utils/quat.js"
import type {V3} from "./utils/v3.js"
import {MemoIncoming} from "../netcode/types.js"
import {Description} from "../netcode/world/types.js"
import {ThumbStick} from "./utils/thumbsticks/thumb-stick.js"
import type {makeKeyListener} from "./utils/key-listener.js"
import type {makeMouseTracker} from "./utils/mouse-tracker.js"

export type Quality = "q0" | "q1"

export type GetAccess = () => AccessPayload
export type AccessListeners = Set<(access: AccessPayload) => void>

export interface Thumbsticks {
	left: ThumbStick
	right: ThumbStick
}

export interface SpawnOptions {
	middle: V3
	quality: Quality
	scene: BABYLON.Scene
	canvas: HTMLCanvasElement
	engine: BABYLON.Engine
	renderLoop: Set<() => void>
	mouseTracker: ReturnType<typeof makeMouseTracker>
	keyListener: ReturnType<typeof makeKeyListener>
	thumbsticks: Thumbsticks
	playerId: string
	getAccess: GetAccess
	accessListeners: AccessListeners
}

export enum CharacterType {
	Robot,
	Man,
	Woman,
}

export interface EntityDescription extends Description {
	type: string
}

export interface SpawnDetails<xDescription extends EntityDescription> {
	host: boolean
	description: xDescription
	sendMemo(memo: any): void
}

export interface Entity<xDescription extends EntityDescription = EntityDescription> {
	update(description: xDescription): void
	describe(): xDescription
	dispose(): void
	receiveMemo(envelope: MemoIncoming): void
}

export function asEntity<xDescription extends EntityDescription>(
		e: Entity<xDescription>
	) {
	return e
}

export interface Spawner<xDescription extends EntityDescription> {
	({}: SpawnDetails<xDescription>): Promise<Entity<xDescription>>
}

export interface MapButteDescription extends EntityDescription {
	type: "mapButte"
}

export interface MapDesertDescription extends EntityDescription {
	type: "mapDesert"
}

export interface CrateDescription extends EntityDescription {
	type: "crate"
	position: V3
	rotation?: Quat
}

export interface PlayerDescription extends EntityDescription {
	type: "player"
	position: V3
	playerId: string
	character: CharacterType
	color?: V3
	movement?: V2
	rotation?: V2
}

export interface DunebuggyDescription extends EntityDescription {
	type: "dunebuggy"
	position: V3
}

export type AnyEntityDescription =
	| MapDesertDescription
	| MapButteDescription
	| CrateDescription
	| PlayerDescription
	| DunebuggyDescription
