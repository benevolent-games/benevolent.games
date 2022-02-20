
import {BenevolentWebsiteContext} from "./types.js"
import {buildWebsite} from "xiome/x/toolbox/hamster-html/website/build-website.js"

const mode = <BenevolentWebsiteContext["mode"]>process.argv[2]
if (!mode) {
	console.error(`website build requires argument "mode"`)
	process.exit(-1)
}

await buildWebsite<BenevolentWebsiteContext>({
	inputDirectory: "x/web/templates",
	outputDirectory: "x",
	excludes: [],
	logWrittenFile: path => console.log("write", path),
	context: {
		mode,
	},
})

console.log("website done")
