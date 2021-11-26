
import {noop as html} from "../utils/template-noop.js"
export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width,initial-scale=1"/>
	<title>axiom.games play</title>

	<style>
		* {
			padding: 0;
			margin: 0;
		}
		html, body, canvas {
			background: #222;
			width: 100%;
			height: 100%;
		}
		canvas {
			position: relative;
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
			padding: 0.5em;
			color: white;
		}
	</style>

	<link rel=preconnect href="https://fonts.gstatic.com"/>
	<link rel=stylesheet href="https://fonts.googleapis.com/css2?family=Titillium+Web&display=swap"/>

	<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png"/>
	<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png"/>
	<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png"/>

	<script type=module defer src=${debug ? "axiom.bundle.js" : "axiom.bundle.min.js"}></script>
</head>
<body>
	<canvas id=renderport></canvas>
	<ul class=stats>
		<p class=fps>fps <span>--</span></p>
	</ul>
</html>

`
