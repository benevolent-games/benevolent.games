
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
	text-shadow: 1px 2px 3px #0008;
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
}

.stats p {
	background: #1118;
}

.game .floating {
	pointer-events: none;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	padding: 0.5em;
}

.game .floating .buttonbar > div,
.game .floating .debug {
	pointer-events: auto;
}

.game .buttonbar {
	display: flex;
	flex-direction: row;
	gap: 0.2em;
	color: white;
	text-shadow: 1px 2px 3px #000a;
}

.game body[data-pointer-lock="true"] .buttonbar .hide-when-pointer-locked {
	visibility: hidden;
}

.game .buttonbar > div {
	border-radius: 0.5rem;
	background: transparent;
	display: flex;
	flex-direction: row;
	gap: 0.2em;
}

.game .buttonbar .indicators {
	margin-left: auto;
	margin-right: 1em;
}

.game .buttonbar > div > :is(button, div, a) {
	padding: 0.2rem;
	border: 1px solid transparent;
	border-radius: 0.5rem;
}

.game .buttonbar > div > :is(button, a) {
	color: inherit;
	padding: 0.2rem 0.3rem;

	opacity: 0.8;
	cursor: pointer;
	background: #1118;
}

.game .buttonbar > div > div {
	opacity: 0.5;
}

.game .buttonbar :is(button, a):hover {
	opacity: 1;
	border: 1px solid currentColor;
}

.game .buttonbar :is(button, a):active {
	background: #111a;
}

.game .buttonbar > div :is(span, a) {
	display: flex;
	justify-content: center;
	align-items: center;
}

.game .buttonbar svg {
	line-height: 0;
	width: 1.5rem;
	height: 1.5rem;
	filter: drop-shadow(1px 2px 3px #000a);
}

.game .buttonbar .invite {
	position: relative;
	z-index: 1;
}
.game .buttonbar .invite[data-copied]::after {
	content: "copied invite link";
	display: block;
	width: max-content;
	position: absolute;
	top: 0;
	left: 90%;
	padding: 0.2em 0.3em;
	border-radius: 0.5em;
	background: green;
	color: white;
	text-shadow: 1px 2px 3px #000a;
	pointer-events: none;
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

.game .debug {
	margin-top: 0.5em;
	padding: 0.5em;
	max-width: 24em;
	color: white;
	text-shadow: 1px 1px 0 #0008;
	font-size: 0.5em;
	font-family: monospace;
}

.game .debug ul {
	padding-left: 1.5em;
}

.game .debug .id {
	color: lime;
}

.game .debug .time {
	color: yellow;
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
