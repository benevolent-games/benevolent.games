
import {V2} from "../../../utils/v2.js"

export function makeInstance(mesh: BABYLON.Mesh, [x, z]: V2) {
	const instance = mesh.createInstance("mapinstance")
	instance.setParent(null)
	instance.physicsImpostor = new BABYLON.PhysicsImpostor(
		instance,
		BABYLON.PhysicsImpostor.MeshImpostor,
		{mass: 0, friction: 1, restitution: 0},
	)
	instance.position.x = x
	instance.position.z = z
	return instance
}
