
export interface KeyState {
	isDown: boolean
}

export interface KeyAction {
	(keyState: KeyState): void
}

export function makeKeyListener() {
	const keyStates = new Map<string, KeyState>()
	const keyActions = new Map<string, Set<KeyAction>>()

	function getKeyState(key: string): KeyState {
		return keyStates.get(key) ?? {isDown: undefined}
	}

	function setKeyDownState(key: string, isDown: boolean): boolean {
		const oldState = keyStates.get(key) ?? {isDown: undefined}
		const newState: KeyState = {...oldState, isDown}
		const isChanged = oldState.isDown !== isDown
		keyStates.set(key, newState)
		return isChanged
	}

	function triggerKeyActions(key: string) {
		const actions = keyActions.get(key)
		if (actions) {
			const keyState = getKeyState(key)
			for (const action of actions)
				action(keyState)
		}
	}

	function assertKeyActionSet(key: string) {
		let set = keyActions.get(key)
		if (!set) {
			set = new Set()
			keyActions.set(key, set)
		}
		return set
	}

	window.addEventListener("keydown", ({key}) => {
		if (!document.pointerLockElement)
			return
		key = key.toLowerCase()
		const isChanged = setKeyDownState(key, true)
		if (isChanged)
			triggerKeyActions(key)
	})

	window.addEventListener("keyup", ({key}) => {
		if (!document.pointerLockElement)
			return
		key = key.toLowerCase()
		const isChanged = setKeyDownState(key, false)
		if (isChanged)
			triggerKeyActions(key)
	})

	return {
		getKeyState,
		on(key: string, action: KeyAction) {
			const set = assertKeyActionSet(key)
			set.add(action)
			return () => set.delete(action)
		},
		clear(key: string) {
			const set = assertKeyActionSet(key)
			set.clear()
		},
	}
}
