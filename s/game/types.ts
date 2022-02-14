
import type {V3} from "./utils/v3.js"
import {Description} from "../netcode/world/types.js"
import {ThumbStick} from "./utils/thumbsticks/thumb-stick.js"
import type {makeKeyListener} from "./utils/key-listener.js"
import type {makeMouseLooker} from "./utils/mouse-looker.js"

export type Quality = "q0" | "q1"

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
	looker: ReturnType<typeof makeMouseLooker>
	keyListener: ReturnType<typeof makeKeyListener>
	thumbsticks: Thumbsticks
}

export interface EntityDescription extends Description {
	type: string
}

export interface SpawnDetails<xDescription extends EntityDescription> {
	host: boolean
	description: xDescription
}

export interface Entity<xDescription extends EntityDescription = EntityDescription> {
	update(description: xDescription): void
	describe(): xDescription
	dispose(): void
}

export interface Spawner<xDescription extends EntityDescription> {
	({}: SpawnDetails<xDescription>): Promise<Entity<xDescription>>
}

export interface EnvironmentDescription extends EntityDescription {
	type: "environment"
}

export interface CrateDescription extends EntityDescription {
	type: "crate"
	position: V3
}

export interface PlayerDescription extends EntityDescription {
	type: "player"
	position: V3
}

export interface DunebuggyDescription extends EntityDescription {
	type: "dunebuggy"
	position: V3
}

export type AnyEntityDescription =
	| EnvironmentDescription
	| CrateDescription
	| PlayerDescription
	| DunebuggyDescription
