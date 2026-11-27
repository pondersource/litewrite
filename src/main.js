const Backbone = require('backbone')
const Litewrite = require('./litewrite')
const Router = require('./router')
const utils = require('./utils')
const { connectAtomic } = require('./atomic-storage')
const connectStandalone = require('./standalone-storage')

// Keep the hash across standalone storage initialization.
const originalHash = window.location.hash
const embedded = new URLSearchParams(window.location.search).get('embed') === 'atomic'

if (embedded) {
  const editor = document.getElementById('editor')
  const status = document.getElementById('remotestorage-connect')
  status.setAttribute('role', 'status')
  editor.disabled = true

  function showStatus (message) {
    status.textContent = message
  }

  showStatus('Connecting to Atomic…')
  connectAtomic(showStatus).then(documents => {
    start({ documents, onError: error => showStatus(error.message) }, () => {
      editor.disabled = false
      if (status.textContent === 'Connecting to Atomic…') showStatus('Atomic storage connected')
    })
  }).catch(error => showStatus(error.message))
} else {
  if (window.PRODUCTION && 'serviceWorker' in navigator) utils.registerServiceWorker()
  start(connectStandalone)
}

function start (storage, onReady) {
  const litewrite = new Litewrite(storage).on('ready', () => {
    if (onReady) onReady()
    window.location.hash = originalHash
    Backbone.history.start()
  })
  litewrite.router = new Router({ litewrite })
}
