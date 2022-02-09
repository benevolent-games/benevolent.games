
import {Rando} from "dbmage"
import {TemplateResult} from "lit"
import {makeAccessModel} from "xiome/x/features/auth/aspects/users/models/access-model"
import {makeNetworkingState} from "../common/make-networking-state.js"

export interface NetSetupOptions {
	rando: Rando
	state: ReturnType<typeof makeNetworkingState>
	accessModel: ReturnType<typeof makeAccessModel>
	writeNetworking: (template: TemplateResult) => void
	writeIndicators: (template: TemplateResult) => void
	writeDebug: (template: TemplateResult) => void
	writeScoreboard: (template: TemplateResult) => void
}
