
![](/assets/website/favicon/android-chrome-192x192.png)

# https://benevolent.games/

community-powered games

join our [discord](https://discord.gg/BnZx2utdev)

<br/>

## how to work on benevolent games as a developer

<br/>

### 💡 getting started

&nbsp; **fundamental skills**
- ℹ️ you don't have to master these skills. just be aware of them, so you know what to study when you encounter the need
- learn how to use git and github so you can collaborate
  - fork projects on github
  - use a visualization tool like `gitk` to understand git graphs
  - make and manage branches
  - add and reset staged changes, make and amend commits
  - manage git remotes, fetch, pull, and pull branches
  - interactive rebase to rewrite and cleanup history
  - keep your branches up to date by rebasing onto master regularly
  - resolve and merge conflicts
  - make pull requests on github, and respond to code reviews
- learn the basics of using a bash shell
- learn the basics of typescript
- learn npm to install dependencies and run npm package scripts
- learn how to write code that blends in with the style and formatting of the rest of the codebase
- please be aware of the whitespace you author (the vscode setting `Render whitespace` setting `Boundary` is great for this)

&nbsp; **technical prerequisites**
- if you're on windows, first, setup [wsl](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) and learn how it works
  - or otherwise install a linux virtual machine for development (we recommend debian+kde on vmware)
- install `git`, `nodejs`, `vscode`, and [connect github with ssh keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

&nbsp; **initial setup**
- fork the benevolent games project on github, and git clone your fork
- open a terminal (linux shell) in your cloned directory, and run these commands
  - `npm install` to install the project's dependencies
  - `npm run build` to run a full build of the project

&nbsp; **during your development sessions**
- first, run `npm install && npm run build`, especially if you've recently pulled any changes
- run these background processes, each in their own shell
  - `npm run watch` to continually rebuild source files on save
  - `npm start` to run a local http server at http://localhost:8080/  
    *(if npm start fails, try it again, it often works the second time)*
  - *note:* [tmux](https://en.wikipedia.org/wiki/Tmux) is a great way to split terminal windows
  - *note:* of course, when you're done, end each process by pressing `ctrl+c`
- open vscode by running `code .`
- open your web browser
  - disable your browser's caching
    - open chrome's developer tools
    - in the network tab, enable "disable cache" mode
    - or find the equivalent in your plebeian browser
  - see the benevolent games website at http://localhost:8080/
- now you are ready to code
  - whenever you save a typescript file, the watch routine will automatically rebuild it, then you can refresh the browser to see your changes
  - you can also press vscode hotkey `ctrl+shift+b` to run the typescript build, which allows vscode to nicely highlight typescript errors for you to address

&nbsp; **the more you know**
- this is an open source project, all contributions are under the mit license
