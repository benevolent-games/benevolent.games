
import headBasicsHtml from "../partials/head-basics.html.js"
import {noop as html} from "../utils/template-noop.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	${headBasicsHtml({title: "axiom.games play"})}
	<script
		type=module
		defer
		src="${debug ? "axiom.bundle.js" : "axiom.bundle.min.js"}"
	></script>
</head>
<body class=game>
	<canvas id=renderport></canvas>
	<ul class=stats>
		<p class=fps>fps <span>--</span></p>
	</ul>
</body>
</html>

`
