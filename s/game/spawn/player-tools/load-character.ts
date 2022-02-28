
import {V3} from "../../utils/v3.js"
import {V2} from "../../utils/v2.js"
import * as v2 from "../../utils/v2.js"
import * as v3 from "../../utils/v3.js"
import {CharacterType} from "../../types.js"
import {loadGlb} from "../../babylon/load-glb.js"
import {between, cap} from "../../utils/numpty.js"

export async function loadCharacter({
		scene, capsule, path, topSpeed, capsuleHeight,
	}: {
		path: string
		scene: BABYLON.Scene
		capsule: BABYLON.Mesh
		topSpeed: number
		capsuleHeight: number
	}) {

	const assets = await loadGlb(scene, path)

	const robotMeshes = assets.meshes.filter(m => m.name.startsWith("robot"))
	const manMeshes = assets.meshes.filter(m => m.name.startsWith("male"))
	const womanMeshes = assets.meshes.filter(m => m.name.startsWith("female"))

	// set colors for man and woman
	const humanMaterial = new BABYLON.StandardMaterial("", scene)
	humanMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)
	for (const mesh of [manMeshes, womanMeshes].flat())
		mesh.material = humanMaterial

	// set ambient color
	for (const mesh of assets.meshes) {
		const material = <BABYLON.PBRMaterial>mesh.material
		if (material)
			material.ambientColor = new BABYLON.Color3(1, 1, 1)
	}

	const root = assets.meshes.find(m => m.name === "__root__")
	root.position.addInPlaceFromFloats(0, -(capsuleHeight / 2), 0)
	root.parent = capsule

	const transform = new BABYLON.TransformNode("", scene)
	transform.parent = root

	function visibility(meshes: BABYLON.AbstractMesh[], visible: boolean) {
		for (const mesh of meshes)
			mesh.isVisible = visible
	}

	function setCharacter(character: CharacterType) {
		visibility(robotMeshes, false)
		visibility(manMeshes, false)
		visibility(womanMeshes, false)
		if (character === CharacterType.Robot)
			visibility(robotMeshes, true)
		else if (character === CharacterType.Man)
			visibility(manMeshes, true)
		else
			visibility(womanMeshes, true)
	}

	setCharacter(CharacterType.Robot)

	function setCustomColors(color: V3) {
		const robotTeamMaterial = <BABYLON.PBRMaterial>assets.materials
			.find(m => m.name === "teamcolor")
		const robotEyeMaterial = <BABYLON.PBRMaterial>assets.materials
			.find(m => m.name === "eyes")
		const bcolor = new BABYLON.Color3(...color)
		robotTeamMaterial.albedoColor = bcolor
		robotEyeMaterial.albedoColor = bcolor
		robotEyeMaterial.emissiveColor = bcolor
		humanMaterial.diffuseColor = bcolor
	}

	const findAnimation = (name: string) =>
		assets.animationGroups.find(a => a.name === name)

	for (const group of assets.animationGroups)
		group.stop()

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

	const skeleton = assets.skeletons[0]

	return {
		meshes: [...assets.meshes],
		transform,
		headBone: skeleton.bones.find(b => b.name === "head"),
		setCharacter,
		setCustomColors,
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

			animations.walking.setWeightForAllAnimatables(Math.abs(forwardness))
			animations.straferight.setWeightForAllAnimatables(cap(rightness, 0, 1))
			animations.strafeleft.setWeightForAllAnimatables(cap(leftness, 0, 1))
		}
	}
}
