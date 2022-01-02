
import {noop as css} from "../utils/template-noop.js"

export default () => css`

a {
	color: #fc0;
	text-decoration: none;
}

a:hover, a:focus {
	color: #ff8;
	text-decoration: none;
}

`
