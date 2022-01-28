
import {css} from "lit"
import {ThumbStick} from "./thumb-stick.js"
import {themeComponents} from "xiome/x/framework/component/theme-components.js"
import {registerComponents} from "xiome/x/framework/component/register-components.js"

const theme = css`
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
`
registerComponents(themeComponents(theme, <any>{ThumbStick}))
