
import {V3} from "../../utils/v3.js"
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import * as v3 from "../../utils/v3.js"
import {loadGlb} from "../../babylon/load-glb.js"
import {between} from "../../utils/numpty.js"

export async function loadCharacter({scene, capsule, path}: {
		path: string
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
	}) {

	const assets = await loadGlb(scene, path)

	assets.meshes
		.filter(m => m.name.includes("female") || m.name.includes("male"))
		.forEach(m => m.isVisible = false)

	for (const mesh of assets.meshes) {
		if (mesh.name.includes("female") || mesh.name.includes("male")) {
			mesh.isVisible = false
		}
		else {
			const material = <BABYLON.PBRMaterial>mesh.material
			if (material)
				material.ambientColor = new BABYLON.Color3(1, 1, 1)
		}
	}

	const robot = assets.meshes.find(m => m.name !== "robot")

	// const scale = 0.5
	// robot.scaling = v3.toBabylon([scale, scale, -scale])
	robot.position.addInPlaceFromFloats(0, -(1.75 / 2), 0)
	robot.parent = capsule

	const findAnimation = (name: string) =>
		assets.animationGroups.find(a => a.name === name)

	for (const group of assets.animationGroups) {
		group.stop()
	}

	const animations = {
		tpose: findAnimation("tpose"),
		idle: findAnimation("idle"),
		wave: findAnimation("wave"),
		lookupdown: findAnimation("lookupdown"),
		walking: findAnimation("walking"),
	}

	const radian = Math.PI / 2
	const lookingFrames = 10
	const lookingSeconds = lookingFrames / 60
	animations.lookupdown.start(false, 0, 0, lookingFrames)
	animations.lookupdown.setWeightForAllAnimatables(1)
	animations.lookupdown.pause()

	animations.walking.start(true, 1)
	animations.walking.setWeightForAllAnimatables(1)

	return {
		animateVerticalLooking(radians: number) {
			const fraction = between(radians, -radian, radian)
			const seconds = fraction * lookingSeconds
			animations.lookupdown.goToFrame(seconds)
		},
		animateWalking(movement: V2) {
			const magnitude = v2.magnitude(movement)
			animations.walking.speedRatio = magnitude / 5
			// animations.walking.setWeightForAllAnimatables(magnitude)
		}
	}
}
