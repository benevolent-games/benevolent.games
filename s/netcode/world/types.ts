
export interface Description {
	[key: string]: any
}

export type Delta<xDescription extends Description = Description> =
	Partial<xDescription>

export interface WorldEvent {
	type: string
	[key: string]: any
}

export interface Changes<xDescription extends Description = Description> {
	additions: [string, xDescription][]
	deltas: [string, Delta<xDescription>][]
	removals: string[]
	events: [string, WorldEvent][]
}
