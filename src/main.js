const Backbone = require('backbone')
const Litewrite = require('./litewrite')
const Router = require('./router')
const utils = require('./utils')
const connectStandalone = require('./standalone-storage')

// Keep the hash across standalone storage initialization.
const originalHash = window.location.hash

if (window.PRODUCTION && 'serviceWorker' in navigator) utils.registerServiceWorker()

const litewrite = new Litewrite(connectStandalone).on('ready', () => {
  window.location.hash = originalHash
  Backbone.history.start()
})
litewrite.router = new Router({ litewrite })
