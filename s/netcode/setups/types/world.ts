
import {Profile} from "xiome/x/features/auth/aspects/users/types/profile"

export interface AuthedUser {
	userId: string
	profile: Profile
}

export interface GuestUser {
	nickname: string
}

export interface ScoreboardPlayer {
	clientId: string
	host: boolean
	ping: number
	lag: number
	guest: GuestUser
	user?: AuthedUser
}

export interface Scoreboard {
	runtime: number
	players: ScoreboardPlayer[]
}
