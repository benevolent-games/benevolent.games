
import {noop as html} from "../utils/template-noop.js"
export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width,initial-scale=1"/>
	<title>axiom.games</title>

	<link rel=stylesheet href="/style.css"/>

	<link rel=preconnect href="https://fonts.gstatic.com"/>
	<link rel=stylesheet href="https://fonts.googleapis.com/css2?family=Titillium+Web&display=swap"/>

	<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png"/>
	<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png"/>
	<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png"/>
	<link rel="manifest" href="/assets/favicon/site.webmanifest"/>
</head>
<body>
	<main style="display: none">
		<h1><img alt="axiom" src="./assets/axiom.svg"/></h1>
		<p>the axiom vr sandbox</p>
		<p>is currently being conceptualized</p>
		<p>by distinguished geniuses with exceptionally large brains</p>
		<p><a href="https://github.com/chase-moskal/">@chase-moskal</a></p>
	</main>

	<script>
		const {style} = document.querySelector("main")

		function setAnimationStart() {
			style.opacity = "0"
			style.transform = "scale(1.1)"
			style.display = "block"
		}

		function setAnimationEnd() {
			style.transition = "all ease 4s"
			style.opacity = "1"
			style.transform = "scale(1)"
		}

		function delay(func) {
			setTimeout(func, 0)
		}

		setAnimationStart()
		delay(setAnimationEnd)
	</script>
</body>
</html>

`
