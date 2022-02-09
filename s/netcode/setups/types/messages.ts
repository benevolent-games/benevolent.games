
import {AuthedUser, Scoreboard} from "./world.js"

export interface MessageFromClient {
	id: number
	user?: AuthedUser
}

export interface MessageFromHost {
	id: number
	scoreboard: Scoreboard
}
