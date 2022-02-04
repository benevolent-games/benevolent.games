
export function noop(strings: TemplateStringsArray, ...values: any[]) {
	const lastIndex = strings.length - 1
	return strings
		.slice(0, lastIndex)
		.reduce((a, b, c) => a + b + values[c], "")
			+ strings[lastIndex]
}

export function strings(strings: TemplateStringsArray, ...values: any[]) {
	return strings
}
