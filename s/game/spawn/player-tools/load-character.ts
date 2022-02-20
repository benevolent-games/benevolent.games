
import {V3} from "../../utils/v3.js"
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import * as v3 from "../../utils/v3.js"
import {loadGlb} from "../../babylon/load-glb.js"
import {between, cap} from "../../utils/numpty.js"

export async function loadCharacter({scene, capsule, path, topSpeed}: {
		path: string
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
		topSpeed: number
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

	console.log("animations", assets.animationGroups.map(a => a.name))

	const animations = {
		tpose: findAnimation("tpose"),
		idle: findAnimation("idle"),
		wave: findAnimation("wave"),
		walking: findAnimation("walking"),
		lookupdown: findAnimation("lookupdown"),
		strafeleft: findAnimation("strafeleft"),
		straferight: findAnimation("straferight"),
	}

	const radian = Math.PI / 2
	const lookingFrames = 10
	const lookingSeconds = lookingFrames / 60

	animations.lookupdown.start(false, 0, 0, lookingFrames)
	animations.lookupdown.pause()

	animations.straferight.start(true, 1)
	animations.strafeleft.start(true, 1)
	animations.walking.start(true, 1)

	return {
		animateVerticalLooking(radians: number) {
			const fraction = between(radians, -radian, radian)
			const seconds = fraction * lookingSeconds
			animations.lookupdown.goToFrame(seconds)
		},
		animateWalking(movement: V2) {
			const forward: V2 = [0, 1]
			const right: V2 = [1, 0]

			const forwardSpeed = v2.dot(movement, forward) / topSpeed
			const rightSpeed = v2.dot(movement, right) / topSpeed
			const leftSpeed = -rightSpeed

			const normalized = v2.normalize(movement)
			let forwardness = v2.dot(normalized, forward)
			let rightness = v2.dot(normalized, right)
			let leftness = -rightness

			animations.walking.speedRatio = forwardSpeed * 2
			animations.straferight.speedRatio = rightSpeed * 2
			animations.strafeleft.speedRatio = leftSpeed * 2

			console.log(forwardness, leftness, rightness)

			animations.walking.setWeightForAllAnimatables(Math.abs(forwardness))
			animations.straferight.setWeightForAllAnimatables(cap(rightness, 0, 1))
			animations.strafeleft.setWeightForAllAnimatables(cap(leftness, 0, 1))
		}
	}
}
