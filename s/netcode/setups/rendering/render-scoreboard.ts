
import {html, svg} from "lit"
import {Scoreboard} from "../types/world.js"
import wifiSvg from "../../../web/icons/feather/wifi.svg.js"
import wifiOffSvg from "../../../web/icons/feather/wifi-off.svg.js"
import crownSvg from "../../../web/icons/tabler/crown.svg.js"

export function renderScoreboard({sessionId, scoreboard}: {
		sessionId: string
		scoreboard: Scoreboard
	}) {
	return sessionId
		? html`
			<table>
				<tbody>
					${scoreboard.players.map(player => html`
						<tr>
							<td class=host>
								${player.host
									? svg(crownSvg)
									: null}
							</td>
							<td class=user>
								${player.user
									? html`
										<xio-avatar
											.spec=${player.user.profile.avatar}
										></xio-avatar>
										<div class=playername>
											<span>${player.user.profile.nickname}</span>
											<span>${player.user.profile.tagline}</span>
										</div>
									`
									: html`
										<xio-avatar></xio-avatar>
										<div class=playername>
											<span>${player.guest.nickname}</span>
										</div>
									`}
							</td>
							<td class=ping ?data-laggy=${player.ping > 200}>
								${player.ping.toFixed(0)}ms
							</td>
							<td class=lag ?data-laggy=${player.lag > 500}>
								<div class=verticalcenter>
									${player.lag > 500
										? html`${svg(wifiOffSvg)} <span>${(player.lag / 1000).toFixed(1)}s</span>`
										: svg(wifiSvg)}
								</div>
							</td>
						</tr>
					`)}
				</tbody>
			</table>
		`
		: null
}
