module.exports = function connectStandalone (litewrite) {
  const RemoteStorage = require('remotestoragejs')
  const Documents = require('remotestorage-module-documents')
  const Widget = require('remotestorage-widget')
  const State = require('./models/state')
  const storageApiKeys = require('./storage-providers.json')

  RemoteStorage.Atomic.loadSDK = () => {
    const sdk = new URL('atomic-sdk/index.mjs', document.baseURI)
    return import(/* webpackIgnore: true */ sdk.href)
  }
  const rs = new RemoteStorage({ modules: [Documents] })
  rs.setApiKeys(storageApiKeys)
  rs.access.claim('documents', 'rw')
  rs.caching.enable('/documents/notes/')
  new Widget(rs, { solidProviders: { allowAnyProvider: true } }).attach('remotestorage-connect')
  rs.on('connected', () => litewrite.triggerConnected(rs.backend))
  rs.on('disconnected', litewrite.triggerDisconnected)

  return {
    documents: rs.documents.privateList('notes'),
    publicDocuments: rs.documents.publicList('notes'),
    state: new State()
  }
}
