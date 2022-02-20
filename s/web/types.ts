
import {WebsiteContext} from "xiome/x/toolbox/hamster-html/website/build-website-types.js"

export interface BenevolentWebsiteContext extends WebsiteContext {
	mode: "debug" | "production"
}
