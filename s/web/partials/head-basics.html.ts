
import {noop as html} from "../utils/template-noop.js"

export default ({title}: {title: string}) => html`

<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>

<link rel=stylesheet href="/style.css"/>

<link rel=preconnect href="https://fonts.gstatic.com"/>
<link rel=stylesheet href="https://fonts.googleapis.com/css2?family=Titillium+Web&display=swap"/>

<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png"/>

`
