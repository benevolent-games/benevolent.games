
export interface Description {
	[key: string]: any
}

export interface Delta extends Partial<Description> {}

export interface WorldEvent {
	type: string
	[key: string]: any
}

export interface Changes {
	deltaEntries: [string, Delta][]
	eventEntries: [string, WorldEvent][]
}
