
export function findTouchAppleFriendly(touchId: number, touches: TouchList) {
	for (let i = 0; i < touches.length; i++) {
		const touch = touches[i]
		if (touch.identifier === touchId)
			return touch
	}
}
