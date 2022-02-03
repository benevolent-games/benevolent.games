
import "ammojs-typed/ammo/ambient/ammo.js"

export declare interface Window {
	BABYLON:
		typeof import("babylonjs") &
		typeof import("babylonjs-materials") &
		typeof import("babylonjs-loaders")
}

declare global {
	interface Window {
		scene: BABYLON.Scene
		engine: BABYLON.Engine
		pick: BABYLON.AbstractMesh
	}
}
