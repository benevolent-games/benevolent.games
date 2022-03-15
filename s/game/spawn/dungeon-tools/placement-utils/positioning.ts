
import {V2} from "../../../utils/v2.js"
import * as v2 from "../../../utils/v2.js"

export function preparePositioning({bigSize, smallSize}: {
		bigSize: number
		smallSize: number
	}) {

	return {

		big(bigPoint: V2) {
			return v2.multiplyBy(bigPoint, bigSize)
		},

		small(bigPoint: V2, smallPoint: V2) {
			const bigOffset = v2.addBy(
				v2.multiplyBy(bigPoint, bigSize),
				-(bigSize / 2)
			)
			const smallOffset = v2.multiplyBy(smallPoint, smallSize)
			const totalOffset = v2.add(bigOffset, smallOffset)
			return v2.addBy(
				totalOffset,
				smallSize / 2
			)
		}
	}
}
