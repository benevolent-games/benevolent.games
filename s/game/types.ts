
import type {V3} from "./utils/v3.js"
import type {makeKeyListener} from "./utils/key-listener.js"
import type {makeMouseLooker} from "./utils/mouse-looker.js"

export interface SpawnOptions {
	middle: V3
	scene: BABYLON.Scene
	canvas: HTMLCanvasElement
	engine: BABYLON.Engine
	renderLoop: Set<() => void>
	looker: ReturnType<typeof makeMouseLooker>
	keyListener: ReturnType<typeof makeKeyListener>
}
