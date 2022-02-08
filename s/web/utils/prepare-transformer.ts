
import {writeFile} from "fs/promises"
import {HtmlTemplate, render} from "xiome/x/toolbox/hamster-html/html.js"

export function prepareTransformer(prefix: string) {
	return async function transform(path: string, content: HtmlTemplate | string) {
		const string = content instanceof HtmlTemplate
			? render(content)
			: content
		await writeFile(prefix + path, string.trim())
	}
}
