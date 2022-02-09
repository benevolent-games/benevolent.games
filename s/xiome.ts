
import "xiome/x/assembly/frontend/types/window-globals.js"

import {assembleXiome} from "xiome/x/assembly/assemble-xiome.js"
import {registerComponents} from "xiome/x/framework/component.js"
import {readXiomeConfig} from "xiome/x/assembly/frontend/read-xiome-config.js"

export async function installXiome(): Promise<ReturnType<typeof assembleXiome>> {
	const xiome = await assembleXiome(readXiomeConfig())
	document.body.prepend(xiome.modalsElement)
	registerComponents(xiome.components)
	window.xiome = xiome
	return xiome
}
