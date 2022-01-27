
import {noop as html} from "../utils/template-noop.js"
import headBasicsHtml from "../partials/head-basics.html.js"

const urls = {
	discord: "https://discord.gg/BnZx2utdev",
	github: "https://github.com/chase-moskal/benevolent.games",
}

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html class="home">
<head>
	${headBasicsHtml({title: "benevolent.games"})}
	<style>
		main > h1 > .logo-unit { display: none; }
	</style>
</head>
<body>
	<main>
		<h1>
			<div class="logo">
				<div class="logo-unit">
					<img src="/assets/website/b.svg" alt=""/>
					<span>benevolent.games</span>
				</div>
			</div>
		</h1>
		<ol class="gamegrid" data-high-quality="false">
			<li>
				<a href="/humanoid">
					<div class="poster">
						<img src="/assets/website/posters/humanoid.webp" alt=""/>
					</div>
					<div class="title">humanoid</div>
				</a>
			</li>
		</ol>
		<div class="qualityselector">
			<label>
				<input class="qualitycheckbox" type="checkbox"/>
				<span>Launch in High-Quality <em>(more megabytes!)</em></span>
			</label>
		</div>
		<hr/>
		<section>
			<h2>community-powered games</h2>
			<p>we're all growing tired of the greed and corporatism of the modern gaming industry. <em>let's make something different.</em></p>
			<p>here at benevolent games, we're working hard to reinvent game development.</p>
			<p><strong>humanoid</strong> is our first prototype project. it's a sandbox where we can experiment with new game ideas. we just got started, so it's seriously not playable yet, we're just assembling the basics.. but we make progress every week ;)</p>
			<p>
				<a href="${urls.discord}">➡️ join benevolent on discord</a>
				<br/>
				<a href="${urls.github}">➡️ collaborate together on github</a>
			</p>
		</section>
		<hr/>
		<h2 style="text-align: center;">we believe games can...</h2>
		<div class="explaingrid">
			<div>
				<h3>🌎 run on any device</h3>
				<h4>let's invite everyone to play.</h4>
				<p>laptops, desktops, phones, and even vr. we develop games for the web, so installations aren't necessary.</p>
			</div>
			<div>
				<h3>📖 be open source</h3>
				<h4>mit licensed.</h4>
				<p>anybody can freely contribute, use our code and art, fork our games, and make their own new games. let's blur the lines between developers, modders, and the community.</p>
			</div>
			<div>
				<h3>😇 involve the community</h3>
				<h4>games don't need secrecy or nda's.</h4>
				<p>join the developers for weekly play-testing sessions, participate in discussions about new ideas, and report bugs directly to our github issues page.</p>
			</div>
			<div>
				<h3>💸 be funded by donations</h3>
				<h4>what goes around comes around.</h4>
				<p>we believe that if developers act with benevolence and generosity towards gamers, the community just might return the favor.</p>
			</div>
		</div>
		<hr/>
		<footer>
			<p>join the <a href="${urls.discord}">discord</a> and get involved on <a href="${urls.github}">github</a></p>
		</footer>
	</main>
	<script>

		void function introAnimation() {
			const {style} = document.querySelector("main > h1 .logo-unit")
	
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
		}()

		void function qualityModeSelection() {
			const storageKey = "benevolent-high-quality"
			const gamegrid = document.querySelector(".gamegrid")
			const checkbox = document.querySelector(".qualitycheckbox")
			const gamelinks = Array.from(
				document.querySelectorAll(".gamegrid > li > a")
			)

			function updateGrid() {
				const {checked} = checkbox
				gamegrid.setAttribute("data-high-quality", checked ? "true" : "false")
			}

			checkbox.oninput = () => {
				const setting = checkbox.checked
					? "true"
					: "false"
				localStorage.setItem(storageKey, setting)
				updateGrid()
			}

			const recollection = localStorage.getItem(storageKey) ?? "false"
			checkbox.checked = recollection === "true"
				? true
				: false
			updateGrid()
		}()

	</script>
</body>
</html>

`
