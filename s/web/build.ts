
import {prepareTransformer} from "./utils/prepare-transformer.js"

import styleCss from "./templates/style.css.js"
import indexHtml from "./templates/index.html.js"
import playgroundHtml from "./templates/playground.html.js"

const options = {
	debug: process.argv.includes("debug")
}

const transform = prepareTransformer("./x/")
await transform("style.css", styleCss(options))
await transform("index.html", indexHtml(options))
await transform("playground.html", playgroundHtml(options))
