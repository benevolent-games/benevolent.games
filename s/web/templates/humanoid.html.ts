
import {noop as html} from "../utils/template-noop.js"
import headBasicsHtml from "../partials/head-basics.html.js"

import maximizeSvg from "../icons/maximize.svg.js"
import minimizeSvg from "../icons/minimize.svg.js"

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
			<script defer type=importmap-shim src="/importmap.json"></script>
			<script defer type=module-shim src="/humanoid.js"></script>
		`
		: html`<script defer type=module src="humanoid.bundle.min.js"></script>`}
</head>
<body data-pointer-lock="false">
	<div class=loading>
		<span>♻️ loading</span>
	</div>
	<div class=buttonbar>
		<div class=controls>
			<button class=fullscreen data-fullscreen=false title="toggle fullscreen">
				<span class=max>${maximizeSvg}</span>
				<span class=min>${minimizeSvg}</span>
			</button>
		</div>
		<div class=networking></div>
		<div class=stats></div>
	</div>
	<div class="mobile">
		<thumb-stick class=left></thumb-stick>
		<thumb-stick class=right></thumb-stick>
	</div>
</body>
</html>

`
