
export type Quat = [number, number, number, number]

export function toBabylon([x, y, z, w]: Quat) {
	return new BABYLON.Quaternion(x, y, z, w)
}

export function fromBabylon(
		{x, y, z, w}: BABYLON.Quaternion
	): [number, number, number, number] {
	return [x, y, z, w]
}
