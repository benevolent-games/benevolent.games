
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
<body data-pointer-lock="false">
	<div class=loading>
		<span>♻️ loading</span>
	</div>
	<ul class=stats></ul>
	<div class=buttonbar>
		<button class=fullscreen data-fullscreen=false title="toggle fullscreen">
			<div class=icon>
				<!-- feather icons, "maximize" and "minimize", from https://feathericons.com/ -->
				<svg class="max feather feather-maximize" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
				<svg class="min feather feather-minimize" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
			</div>
		</button>
	</div>
</body>
</html>

`
