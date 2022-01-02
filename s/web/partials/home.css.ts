
import {noop as css} from "../utils/template-noop.js"

export default () => css`

.home {
	margin: auto;
	padding: 1em 10%;
	max-width: 960px;
	text-align: center;
}

.home h1 {
	font-family: "PT Serif", serif;
	line-height: 0;
	margin-bottom: 1.5rem;
}

.home h1 img {
	display: block;
	width: 100%;
	max-width: 10rem;
	margin: auto;
}

.home h1 span {
	opacity: 0.5;
	font-size: 0.5em;
}

.home p {
	font-size: 0.7em;
	color: #888;
}

.home main > * + div {
	margin-top: 1em;
}

`
