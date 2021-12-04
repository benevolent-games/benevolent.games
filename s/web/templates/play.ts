
import headBasicsHtml from "../partials/head-basics.html.js"
import {noop as html} from "../utils/template-noop.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	${headBasicsHtml({title: "axiom play"})}
	<script defer src="/node_modules/babylonjs/babylon.js"></script>
	<script defer src="/node_modules/babylonjs-materials/babylonjs.materials.min.js"></script>
	<script defer src="/node_modules/babylonjs-loaders/babylonjs.loaders.min.js"></script>
	<script defer src="/node_modules/ammo.js/builds/ammo.js"></script>
	${debug
		? html`
			<script defer src="/node_modules/es-module-shims/dist/es-module-shims.js"></script>
			<script defer type=module src="axiom.js"></script>
		`
		: html`<script defer type=module src="axiom.bundle.min.js"></script>`}
</head>
<body class=game>
	<canvas></canvas>
	<ul class=stats></ul>
</body>
</html>

`
