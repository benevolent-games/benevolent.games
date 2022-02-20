
export function stopwatch() {
	const start = Date.now()
	return {
		elapsed() {
			return Date.now() - start
		},
	}
}
