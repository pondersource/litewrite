const _ = require('underscore')
const Backbone = require('backbone')
const RemoteStorage = require('remotestoragejs')
const RemostStorageDocuments = require('remotestorage-module-documents')
const Widget = require('remotestorage-widget')
const AppView = require('./views/app')
const Doc = require('./models/doc')
const Docs = require('./collections/docs')
const State = require('./models/state')

const dropboxApiKey = '6p6q5imoisraq6k'
const googleDriveClientID = '376607343336-uabp27dse5s1jkr767jpdeqhj7t90bll.apps.googleusercontent.com'

function Litewrite () {
  this.initialize()
}

_.extend(Litewrite.prototype, Backbone.Events, {
  initialize: function () {
    _.bindAll(
      this,
      'loadDoc',
      'open',
      'openOnCreate',
      'handlePrevious',
      'updateDocs',
      'handleRemoteRemove',
      'triggerConnected',
      'triggerDisconnected'
    )

    const rs = new RemoteStorage({ modules: [RemostStorageDocuments] })
    rs.setApiKeys({
      dropbox: dropboxApiKey,
      googledrive: googleDriveClientID
    })
    rs.access.claim('documents', 'rw')
    rs.caching.enable('/documents/notes/')
    new Widget(rs).attach('remotestorage-connect')
    rs.on('connected', _.bind(function () {
      this.triggerConnected(rs.backend)
    }, this))
    rs.on('disconnected', this.triggerDisconnected)

    this.state = new State()
    this.doc = new Doc()
    this.docs = new Docs(null, {
      remote: rs.documents.privateList('notes')
    })

    this.doc
      .on('change:content', this.doc.updateLastEdited)
      .on('change:public', this.doc.updateLastEdited)
      .on('change:content', this.doc.updateTitle)
      .on('change:id', this.handlePrevious)
      .on('change:id', this.setUrl)
      .on('change', this.updateDocs)

    this.state.fetch().always(_.bind(function () {
      this.docs.fetch().always(this.loadDoc)
    }, this))

    this.app = new AppView({
      litewrite: this,
      remote: rs.documents.publicList('notes'),
      model: this.doc,
      collection: this.docs
    })
  },

  loadDoc: function () {
    this.docs
      .on('add', this.openOnCreate)
      .on('remove', this.handleRemoteRemove)

    this.trigger('ready')
  },

  // Open a document. Either pass a Doc or an ID.
  open: function (doc) {
    if (!_.isObject(doc)) {
      doc = this.docs.get(doc)
      if (!doc) {
        this.docs.welcome()
        doc = this.docs.first()
      }
    }
    this.doc.set(doc.toJSON())
  },

  openOnCreate: function (doc) {
    if (doc.isEmpty()) {
      this.open(doc)
    }
  },

  // remove empty documents
  handlePrevious: function (doc) {
    const previous = this.docs.get(doc.previous('id'))
    if (previous && previous.isEmpty()) {
      previous.destroy()
    }
  },

  updateDocs: function (doc) {
    this.docs.set(doc.toJSON(), { add: false, remove: false })
  },

  handleRemoteRemove: function (doc, docs, options) {
    const removedLocally = options.success && options.error
    // Open first doc so editor doesn't display the removed doc
    if (!removedLocally) {
      this.open()
    }
  },

  triggerConnected: function (backend) {
    this.trigger('connected', backend)
  },

  triggerDisconnected: function () {
    this.trigger('disconnected')
    this.docs.reset()
    this.open()
  },

  setUrl: function (doc) {
    Backbone.history.navigate(doc.getUrl())
  }

})

module.exports = Litewrite
