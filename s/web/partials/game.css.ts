
import {noop as css} from "../utils/template-noop.js"

export default () => css`

.game, .game body {
	height: 100%;
	user-select: none;
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
	font-family: monospace;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: auto;
}

.stats p {
	background: #1118;
}

.game .buttonbar {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	padding: 0.5em;
	display: flex;
	flex-direction: row;
	gap: 0.2em;
}

.game body[data-pointer-lock="true"] .buttonbar {
	opacity: 0.4;
}

.game .buttonbar > div {
	padding: 0.2em;
	border-radius: 0.5rem;
	background: #0006;
	display: flex;
	flex-direction: row;
	gap: 0.2em;
}

.game .buttonbar > div > :is(button, div) {
	padding: 0.2rem;
	border: 1px solid transparent;
	border-radius: 0.5rem;
}

.game .buttonbar > div > button {
	color: inherit;
	padding: 0.2rem 0.3rem;

	opacity: 0.8;
	cursor: pointer;
	background: #1118;
}

.game .buttonbar > div > div {
	opacity: 0.5;
}

.game .buttonbar button:hover {
	opacity: 1;
	border: 1px solid currentColor;
}

.game .buttonbar button:active {
	background: #111a;
}

.game .buttonbar > div span {
	display: flex;
	justify-content: center;
	align-items: center;
}

.game .buttonbar svg {
	line-height: 0;
	width: 1.5rem;
	height: 1.5rem;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.game .buttonbar .busy {
	animation: 5s linear spin;
}

.game .buttonbar .fullscreen[data-fullscreen="false"] .min {
	display: none;
}

.game .buttonbar .fullscreen[data-fullscreen="true"] .max {
	display: none;
}

.game body[data-pointer-lock="true"] .mobile {
	display: none;
}

.game .mobile {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	pointer-events: none;

	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.game .mobile thumb-stick {
	opacity: 0.2;
	width: 7em;
	height: 7em;
	margin: 2em;
	pointer-events: auto;
}

`
