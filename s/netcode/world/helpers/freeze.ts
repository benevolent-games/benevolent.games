
export function freeze<X extends {}>(object: X): X {
	return Object.freeze(object)
}
