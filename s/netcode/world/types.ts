
export interface Description {
	entity: string
	[key: string]: any
}

export interface Delta extends Partial<Description> {
	entity: string
}

export interface WorldEvent {
	type: string
	[key: string]: any
}
