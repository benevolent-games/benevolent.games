
export interface RemotePromise<Payload> {
	resolve: (payload: Payload) => void
	reject: (error: any) => void
	promise: Promise<Payload>
}

export function remotePromise<Payload>(): RemotePromise<Payload> {
	let resolve: (payload: Payload) => void
	let reject: (reason: any) => void
	const promise = new Promise<Payload>((res, rej) => {
		resolve = res
		reject = rej
	})
	return {
		promise,
		resolve,
		reject,
	}
}
