
export async function loadGlb(scene: BABYLON.Scene, link: string) {
	const subpath = null
	console.log(`♻️ loading "${link}"`)

	const assetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(
		link,
		subpath,
		scene,
		function onProgress({
				loaded, total, lengthComputable,
			}: BABYLON.ISceneLoaderProgressEvent) {
			if (lengthComputable) {
				const percent = (loaded / total) * 100
				if (percent >= 0 && percent <= 100) {
					const progress = percent == 100
						? "99"
						: percent.toFixed(0).padStart(2, "0")
					console.log(`📩 ${progress}% ${link}`)
				}
			}
		},
	)

	// const assetContainer = await BABYLON.SceneLoader.AppendAsync(
	// 	link,
	// 	subpath,
	// 	scene,
	// 	function onProgress({
	// 			loaded, total, lengthComputable,
	// 		}: BABYLON.ISceneLoaderProgressEvent) {
	// 		if (lengthComputable) {
	// 			const percent = (loaded / total) * 100
	// 			if (percent >= 0 && percent <= 100) {
	// 				const progress = percent == 100
	// 					? "99"
	// 					: percent.toFixed(0).padStart(2, "0")
	// 				console.log(`📩 ${progress}% ${link}`)
	// 			}
	// 		}
	// 	},
	// )

	console.log(`✔️ done ${link}`)
	return assetContainer
}
