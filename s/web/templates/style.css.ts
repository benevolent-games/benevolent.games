
import gameCss from "../partials/game.css.js"
import homeCss from "../partials/home.css.js"
import linksCss from "../partials/links.css.js"
import {noop as css} from "../utils/template-noop.js"

export default () => css`

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

html {
	font-size: 21px;
	color: #aaa;
	background: #222;
	font-family: "PT Serif", serif;
}

${linksCss()}
${homeCss()}
${gameCss()}

`
