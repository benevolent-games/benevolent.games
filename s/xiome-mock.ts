
import "xiome/x/assembly/frontend/types/window-globals.js"

import {registerComponents} from "xiome/x/framework/component.js"
import {assembleXiomeMock} from "xiome/x/assembly/assemble-mocks.js"
import {readXiomeMock} from "xiome/x/assembly/frontend/read-xiome-mock.js"

export async function installXiomeMock():
		Promise<ReturnType<typeof assembleXiomeMock>> {

	const xiome = await assembleXiomeMock(readXiomeMock())
	document.body.prepend(xiome.modalsElement)
	registerComponents(xiome.components)
	window.xiome = xiome

	return xiome
}
