
import {html, html as svg} from "xiome/x/toolbox/hamster-html/html.js"
import headBasicsHtml from "../partials/head-basics.html.js"

import benevolentSvg from "../icons/benevolent.svg.js"
import maximizeSvg from "../icons/feather/maximize.svg.js"
import minimizeSvg from "../icons/feather/minimize.svg.js"

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
	<div class=floating>
		<div class=buttonbar>
			<div class="hide-when-pointer-locked">
				<a target="_blank" href="/" title="benevolent.games">
					${svg(benevolentSvg)}
				</a>
			</div>
			<div class="controls hide-when-pointer-locked">
				<button class=fullscreen data-fullscreen=false title="toggle fullscreen">
					<span class=max>${svg(maximizeSvg)}</span>
					<span class=min>${svg(minimizeSvg)}</span>
				</button>
			</div>
			<div class="networking hide-when-pointer-locked"></div>
			<div class="indicators hide-when-pointer-locked"></div>
			<div class=stats></div>
		</div>
		<div class=debug></div>
	</div>
	<div class="mobile">
		<thumb-stick class=left></thumb-stick>
		<thumb-stick class=right></thumb-stick>
	</div>
</body>
</html>

`
