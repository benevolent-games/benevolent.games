
import {noop as css} from "../utils/template-noop.js"

export default () => css`

a {
	color: #ffe372;
	text-decoration: none;
}

a:visited {
	color: #d9be50;
}

a:hover, a:focus {
	color: #ff8;
	text-decoration: underline;
}

a:hover, a:focus {
	color: #fff;
}

`
