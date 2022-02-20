
import {V3} from "../utils/v3.js"
import * as v3 from "../utils/v3.js"
import {loadGlb} from "../babylon/load-glb.js"
import {DunebuggyDescription, Spawner, SpawnOptions} from "../types.js"

export function spawnDunebuggy({
		quality, scene
	}: SpawnOptions): Spawner<DunebuggyDescription> {
	return async function({host, description}) {
		const assets = await loadGlb(
			scene,
			`/assets/art/dunebuggy/dunebuggy.${quality}.glb`,
		)
		assets.removeAllFromScene()
		assets.addAllToScene()
		const transform = assets.transformNodes[0]
		transform.position = v3.toBabylon(description.position)
		return {
			describe: () => ({
				...description,
				position: description.position,
			}),
			update: description => {
				transform.position = v3.toBabylon(description.position)
			},
			dispose: () => assets.dispose(),
			receiveMemo() {},
		}
	}
}
