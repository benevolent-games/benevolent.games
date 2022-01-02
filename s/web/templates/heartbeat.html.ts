
import headBasicsHtml from "../partials/head-basics.html.js"
import {noop as html} from "../utils/template-noop.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head class="heartbeat">
	${headBasicsHtml({title: "benevolent.games 😇"})}
	<script defer type=module-shim src="/heart/heartbeat-demo.js"></script>
	<script defer type=importmap-shim src="/importmap.json"></script>
	<script defer src="/node_modules/es-module-shims/dist/es-module-shims.js"></script>
</head>
<body>
	<h1>heartbeat network tests</h1>
	<div class=app></div>
</body>
</html>

`
