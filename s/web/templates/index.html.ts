
import {noop as html} from "../utils/template-noop.js"
import headBasicsHtml from "../partials/head-basics.html.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	${headBasicsHtml({title: "benevolent.games"})}
	<style>
		main > h1 { display: none; }
	</style>
</head>
<body class="home">
	<main>
		<h1>
			<img src="/assets/website/b.svg"/>
			<span>benevolent.games</span>
		</h1>
		<ol class="gamegrid">
			<li>
				<a href="#">
					<img src="/assets/website/posters/humanoid.webp" alt=""/>
					<div>humanoid</div>
				</a>
			</li>
		</ol>
		<div>
			<h2>humanoid</h2>
			<p>active development</p>
			<p>by distinguished geniuses</p>
			<p>with exceptionally large brains</p>
		</div>
		<div>
			<p><a href="https://github.com/chase-moskal/">@chase-moskal</a></p>
			<p>and other secret collaborators</p>
		</div>
	</main>
	<script>

		const {style} = document.querySelector("main > h1")

		function startAnimation() {
			style.opacity = "0"
			style.transform = "scale(0.8)"
			style.display = "block"
		}

		function endAnimation() {
			style.transition = "all ease 10s"
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
