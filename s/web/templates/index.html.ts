
import {noop as html} from "../utils/template-noop.js"
import headBasicsHtml from "../partials/head-basics.html.js"

const urls = {
	discord: "https://discord.gg/BnZx2utdev",
	github: "https://github.com/benevolent-bees/benevolent.games",
}

const games: {
	poster: string
	title: string
	link?: string
}[] = [
	{link: "/humanoid", poster: "humanoid.webp", title: "humanoid"},
	{poster: "faster-than-the-slowest-camper.webp", title: "faster than the slowest camper"},
	{poster: "forbearance.webp", title: "forbearance"},
	{poster: "muskets-of-obligation.webp", title: "muskets of obligation"},
	{poster: "the-hopeless.webp", title: "the hopeless"},
	{poster: "will-to-die.webp", title: "will to die"},
]

function gamelink(link: string, content: string) {
	return link
		? html`<a class="unit" ${link ?"data-playable" :""} href="${link}">${content}</a>`
		: html`<div class="unit">${content}</div>`
}

export default ({debug}: {debug: boolean}) => html`

<!doctype html>
<html class="home">
<head>
	${headBasicsHtml({title: "benevolent.games"})}
	<script defer type=module src="/website.js"></script>
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
		<nav class="gamegrid" data-high-quality="false">
			${games.map(({link, poster, title}) => html`
				${gamelink(link, html`
					<div class="hq">
						<span>hq enabled</span>
					</div>
					<div class="poster">
						<img src="/assets/website/posters/${poster}" alt="${title}"/>
					</div>
					<div class="comingsoon" ${link ?"" :"data-active"}>
						<span>coming soon</span>
					</div>
					<div class="title">${title}</div>
				`)}
			`).join("\n")}
		</nav>
		<div class="qualityselector">
			<label>
				<input class="qualitycheckbox" type="checkbox"/>
				<span>Launch in High-Quality <em>(more megabytes!)</em></span>
			</label>
		</div>
		<div class="slice">
			<hr/>
			<section>
				<h2>community-powered games</h2>
				<p>we're all growing tired of the greed and corporatism of the modern gaming industry. <em>let's make something different.</em></p>
				<h3>introducing humanoid</h3>
				<p><strong>humanoid</strong> is a prototype sandbox game template. it's where we experiment with new game mechanics, building a common platform for developers to make new games. it's an early prototype, and we make progress every week.</p>
				<p>all of the source code and art assets are 100% open source.</p>
				<br/>
				<p>
					<a href="${urls.discord}">➡️ join benevolent on discord</a>
					<br/>
					<a href="${urls.github}">➡️ collaborate together on github</a>
				</p>
			</section>
			<hr/>
			<h2 class="believe">we believe games can...</h2>
			<div class="explaingrid">
				<div>
					<h3>🌎 run on any device</h3>
					<h4>let's invite everyone to play.</h4>
					<p>laptops, desktops, phones, and eventually, even vr. we develop games for the web, where no installations are required.</p>
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
		</div>
	</main>
</body>
</html>

`
