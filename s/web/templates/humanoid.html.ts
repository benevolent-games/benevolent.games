
import headBasicsHtml from "../partials/head-basics.html.js"
import {noop as html} from "../utils/template-noop.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html class="game">
<head>
	${headBasicsHtml({title: "humanoid – benevolent"})}
	<script defer src="/node_modules/babylonjs/babylon.js"></script>
	<script defer src="/node_modules/babylonjs-loaders/babylonjs.loaders.min.js"></script>
	<script defer src="/node_modules/babylonjs-materials/babylonjs.materials.min.js"></script>
	<script defer src="/assets/ammo/ammo.wasm.js"></script>
	${debug
		? html`
			<script defer src="/node_modules/es-module-shims/dist/es-module-shims.js"></script>
			<script defer type=module src="main.js"></script>
		`
		: html`<script defer type=module src="main.bundle.min.js"></script>`}
</head>
<body>
	<div class="loading">
		<span>♻️ loading</span>
	</div>
	<ul class=stats></ul>
</body>
</html>

`
