
import {writeFile} from "fs/promises"

export function prepareTransformer(prefix: string) {
	return async function transform(path: string, html: string) {
		await writeFile(prefix + path, html.trim())
	}
}
