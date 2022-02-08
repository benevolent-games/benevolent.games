
import {assembleXiome} from "xiome/x/assembly/assemble-xiome.js"
import {registerComponents} from "xiome/x/framework/component.js"
import {readXiomeConfig} from "xiome/x/assembly/frontend/read-xiome-config.js"

void async function xiome() {
	const xiome = await assembleXiome(readXiomeConfig())
	document.body.prepend(xiome.modalsElement)
	registerComponents(xiome.components)
	;(<any>window).xiome = xiome
}()
