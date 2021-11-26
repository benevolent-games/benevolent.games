
import {noop as html} from "../utils/template-noop.js"
import headBasicsHtml from "../partials/head-basics.html.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	${headBasicsHtml({title: "axiom.games"})}
</head>
<body class="home">
	<main style="display: none">
		<h1><img alt="axiom" src="./assets/axiom.svg"/></h1>
		<div>
			<h2>humanoid</h2>
			<p>is in active development</p>
			<p>by distinguished geniuses</p>
			<p>with exceptionally large brains</p>
		</div>
		<div>
			<p><a href="https://github.com/chase-moskal/">@chase-moskal</a></p>
			<p>and other secret collaborators</p>
		</div>
	</main>
	<script>

		const {style} = document.querySelector("main")

		function startAnimation() {
			style.opacity = "0"
			style.transform = "scale(1.2)"
			style.display = "block"
		}

		function endAnimation() {
			style.transition = "all ease 6s"
			style.opacity = "1"
			style.transform = "scale(1)"
		}

		function delay(func) {
			setTimeout(func, 0)
		}

		startAnimation()
		delay(endAnimation)

	</script>
</body>
</html>

`
