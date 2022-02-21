
import {V3} from "./v3.js"

export function hslToRgb([hue, saturation, lightness]: V3): V3 {
	const a = saturation * Math.min(lightness, 1 - lightness)
	function q(n: number, b = (n + (hue / 30)) % 12) {
		const c = Math.min(b - 3, 9 - b, 1)
		return lightness - (a * Math.max(c, -1))
	}
	return [q(0), q(8), q(4)]
}
