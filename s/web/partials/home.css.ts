
import {noop as css} from "../utils/template-noop.js"

export default () => css`

.home {
	margin: auto;
	padding: 10%;
	padding-top: 3em;
	padding-bottom: 1em;
	max-width: 960px;
	text-align: center;
}

.home h1 img {
	width: 100%;
	max-width: 420px;
}

.home p {
	font-size: 0.7em;
	color: #888;
}

.home main > * + div {
	margin-top: 1em;
}

`
