
import headBasicsHtml from "../partials/head-basics.html.js"
import {noop as html} from "../utils/template-noop.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	${headBasicsHtml({title: "axiom play"})}
	<script
		type=module
		defer
		src="${debug ? "axiom.bundle.js" : "axiom.bundle.min.js"}"
	></script>
</head>
<body class=game>
	<canvas></canvas>
	<ul class=stats></ul>
</body>
</html>

`
