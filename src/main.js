const Backbone = require('backbone')
const Litewrite = require('./litewrite')
const Router = require('./router')
const utils = require('./utils')

// Use service worker for offline caching
if (window.PRODUCTION && 'serviceWorker' in navigator) {
  utils.registerServiceWorker()
}

// This way we can prevent remotestorage from stealing the url hash
const originalHash = window.location.hash

const litewrite = new Litewrite()
  .on('ready', startHistory)

litewrite.router = new Router({ litewrite })

function startHistory () {
  window.location.hash = originalHash
  Backbone.history.start()
}
