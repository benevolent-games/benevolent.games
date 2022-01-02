
import gameCss from "../partials/game.css.js"
import homeCss from "../partials/home.css.js"
import linksCss from "../partials/links.css.js"
import {noop as css} from "../utils/template-noop.js"

export default () => css`

* {
	margin: 0;
	padding: 0;
}

html {
	font-size: 21px;
	color: white;
	background: #222;
	font-family: "Titillium Web", sans-serif;
}

html, body, canvas {
	min-height: 100%;
}

canvas {
	position: relative;
	width: 100%;
	height: 100%;
}

${linksCss()}
${homeCss()}
${gameCss()}

`
