
import {noop as html} from "../utils/template-noop.js"
import headBasicsHtml from "../partials/head-basics.html.js"

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html class="home">
<head>
	${headBasicsHtml({title: "benevolent.games"})}
	<style>
		main > h1 { display: none; }
	</style>
</head>
<body>
	<main>
		<h1>
			<img src="/assets/website/b.svg"/>
			<span>benevolent.games</span>
		</h1>
		<ol class="gamegrid">
			<li>
				<a href="/play">
					<img src="/assets/website/posters/humanoid.webp" alt=""/>
					<div>humanoid sandbox</div>
				</a>
			</li>
		</ol>
		<hr/>
		<section>
			<h2>power to the community</h2>
			<p>we're all growing tired of the greed and corporatism of the modern gaming industry. <em>let's make something different.</em></p>
			<p>here at benevolent games, we're working hard to reinvent gaming.</p>
			<p><a href="https://discord.gg/BnZx2utdev">➡️ join benevolent on discord</a></p>
			<p><a href="https://github.com/chase-moskal/benevolent.games">➡️ collaborate together on github</a></p>
		</section>
		<hr/>
		<h2 style="text-align: center;">we believe games can be...</h2>
		<div class="explaingrid">
			<div>
				<h3>🌎 universal</h3>
				<p>everyone's invited to play: laptops, desktops, phones, and even vr.</p>
				<p>we develop our games on the web, so no installation is necessary, and everyone can play.</p>
			</div>
			<div>
				<h3>📖 open source</h3>
				<h4>games should be open source.</h4>
				<p>anybody can freely fork our games, use our assets, share our code, and make new games.</p>
				<p>blurring the lines between developers, modders, and the community.</p>
			</div>
			<div>
				<h3>💸 funded by donations</h3>
				<h4>we rely on community support to fund our games.</h4>
				<p>we believe that if developers act with belevolence towards gamers, the community might return the favor.</p>
			</div>
		</div>
		<hr/>
		<footer>
			<h3>neato</h3>
		</footer>
	</main>
	<script>

		const {style} = document.querySelector("main > h1")

		function startAnimation() {
			style.opacity = "0"
			style.transform = "scale(0.5)"
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
