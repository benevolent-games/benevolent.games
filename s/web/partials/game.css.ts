
import {noop as css} from "../utils/template-noop.js"

export default () => css`

.game, .game body {
	height: 100%;
}

.game body {
	position: relative;
}

.game .loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

.game .loading span {
	background: #0008;
	padding: 0.5em 1em;
	border-radius: 0.5em;
	text-shadow: 0 1px 2px #0008;
}

canvas {
	position: relative;
	width: 100%;
	height: 100%;
}

.stats {
	display: inline-block;
	position: fixed;
	top: 0;
	right: 0;
	padding: 0.5em;
	list-style: none;
	font-family: monospace;
}

.stats p {
	background: #1114;
	padding: 0.5rem;
	color: white;
	border-radius: 0.5rem;
}

.game .buttonbar {
	position: absolute;
	bottom: 0;
	right: 0;
	padding: 0.5em;
}

.game .buttonbar button {
	opacity: 0.6;

	border: none;
	padding: 0;
	color: inherit;

	cursor: pointer;
	background: #111a;
	padding: 0.5rem;
	border-radius: 0.5rem;
}

.game .buttonbar button:hover {
	opacity: 1;
}

.game .buttonbar svg {
	line-height: 0;
}

.game .buttonbar .fullscreen[data-fullscreen="false"] .min {
	display: none;
}

.game .buttonbar .fullscreen[data-fullscreen="true"] .max {
	display: none;
}

.game body[data-pointer-lock="true"] .buttonbar .fullscreen {
	display: none;
}

`
