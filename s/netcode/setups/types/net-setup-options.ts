
import {Rando} from "dbmage"
import {TemplateResult} from "lit"
import {makeNetworkingState} from "../common/make-networking-state.js"
import {AccessPayload} from "xiome/x/features/auth/types/auth-tokens.js"

export interface NetSetupOptions {
	rando: Rando
	state: ReturnType<typeof makeNetworkingState>
	receive: (data: any) => void
	getAccess: () => AccessPayload
	writeNetworking: (template: TemplateResult) => void
	writeIndicators: (template: TemplateResult) => void
	writeDebug: (template: TemplateResult) => void
	writeScoreboard: (template: TemplateResult) => void
}
