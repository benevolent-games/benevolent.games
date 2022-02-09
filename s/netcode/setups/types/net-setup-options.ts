
import {Rando} from "dbmage"
import {TemplateResult} from "lit"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"
import {makeNetworkingState} from "../common/make-networking-state.js"

export interface NetSetupOptions {
	rando: Rando
	state: ReturnType<typeof makeNetworkingState>
	getAccess: () => AccessPayload
	writeNetworking: (template: TemplateResult) => void
	writeIndicators: (template: TemplateResult) => void
	writeDebug: (template: TemplateResult) => void
	writeScoreboard: (template: TemplateResult) => void
}
