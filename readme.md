# [Litewrite](http://litewrite.net)
**Unobtrusive Writing** by [Jan-Christoph Borchardt](http://jancborchardt.net) & [Jorin Vogel](https://jorin.me)

## Warning: Unmaintained/In search for new maintainer

**Litewrite hasn't been maintained for a couple of years now so if anyone still interested in using it and likes to step up and take over maintaining/improving/rewriting it, please reach out in the [GitHub issues](https://github.com/litewrite/litewrite/issues/304)**


-----

Litewrite was built out of a need to have a simple way of taking notes, having them everywhere, working on any device, regardless if on- or offline.

* simple design
* available everywhere (device compatibility + synced data)
* works offline

No current solution provides that. It's quite strange that something as benign as jotting down text isn't really solved unless you buy into one specific »ecosystem«. Either the design is complicated, or they only work on Apple hardware, or they are tied to Dropbox, or you can't do anything if you don't have wifi, or or or …

So we built Litewrite.

* Simple design: There are lots of other self-titled distraction-free editors which offer music, themes, different typefaces, etc etc. We don't, because we think that's unnecessary. If you want music you can listen to it using your favorite music player, if you want to change the font size you can zoom using your browser, …
* Device compatibility: It’s a web app which works on all devices and operating systems.
* Synced data: Notes are available everywhere, using the open remoteStorage standard, Dropbox or Google Drive.
* Offline: Once loaded, it’s essentially a desktop app. Thanks to AppCache and localStorage, both app and data are fully cached offline and synced whenever online.

Now of course it's far from perfect, but we and lots of others use it day-to-day. And that's also why we made it open source. If you experience any problems or have suggestions, please let us know at http://github.com/litewrite/litewrite/issues.
And if you know a little about web development, you're welcome to dive into the code at http://github.com/litewrite/litewrite.


Cheers,
Jorin & Jan-Christoph


## Contribute

Play with the [development version](http://litewrite.github.com/litewrite), check out [issues](http://github.com/litewrite/litewrite/issues) and dive into the code if you like.

Set up your development environment:

1. `git clone https://github.com/litewrite/litewrite.git`
2. `cd litewrite`
3. Install [node.js](http://nodejs.org/) (v18 or later)
4. Run `npm install` to install the development dependencies
5. `npm run dev` to start a dev server with hot reloading at [http://localhost:8000](http://localhost:8000)
6. Check your code style with `npm run lint`
7. Run the Playwright smoke tests with `npm run test:smoke` (or `npm test` for lint + smoke tests)
8. Build the production version with `npm run build`, then serve it with `npm start`


## Thanks

Inspired by [iA Writer](http://iawriter.com) & [LightWrite](http://gun.io/w). Initial prototype built on [Notes](http://nv.github.com/notes). [Alegreya](http://www.huertatipografica.com.ar/tipografias/alegreya/ejemplos.html) typeface by Juan Pablo del Peral.


## Remotestorage

This is an [unhosted web app](http://unhosted.org), meaning its code is fully client-side, without any server backend you need to trust! It also supports the open [remotestorage](http://remotestorage.io) protocol so you can sync your data across devices & browsers.


## License

Copyright (c) 2012 [Jan-Christoph Borchardt](http://jancborchardt.net) & [Jorin Vogel](https://jorin.me), licensed under the [Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.html) version 3 or later. See license.txt for the full license text. Short: **Do anything you want as long as you credit us and redistribute your changes under the same conditions.**
