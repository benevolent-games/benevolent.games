
import {noop as css} from "../utils/template-noop.js"

export default () => css`

.home {
	margin: auto;
	max-width: 960px;
	text-align: center;
}

.home h1 {
	font-family: "PT Serif", serif;
	line-height: 0;
	margin-bottom: 2rem;
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
	color: #888;
}

.home main > * + div {
	margin-top: 1em;
}

.gamegrid {
	list-style: none;
	display: grid;
	justify-content: center;
	grid-template-columns: repeat(auto-fill, 10em);
}

@media (max-width: 500px) {
	.gamegrid {
		grid-template-columns: repeat(auto-fill, 7em);
	}
}

.gamegrid li {
	padding: 0.2em;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	transform: scale(0.95);
	transition: transform 200ms ease;
}

.gamegrid li:hover,
.gamegrid li:focus {
	transform: scale(1);
}

.gamegrid li > * {
	flex: 0 0 auto;
}

.gamegrid img {
	width: 100%;
	box-shadow: 0.1em 0.5em 1em #0008;
}

.gamegrid div {
	flex: 1 0 auto;
}

`
