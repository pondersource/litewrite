const _ = require('underscore')
const Backbone = require('backbone')
const AppView = require('./views/app')
const Doc = require('./models/doc')
const Docs = require('./collections/docs')

function Litewrite (storage) {
  this.initialize(storage)
}

_.extend(Litewrite.prototype, Backbone.Events, {
  initialize: function (storage) {
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

    const connection = typeof storage === 'function' ? storage(this) : storage
    this.useHistory = connection.useHistory !== false
    this.state = connection.state || new Backbone.Model({ query: '' })
    this.doc = new Doc()
    this.docs = new Docs(null, { remote: connection.documents })

    this.doc
      .on('change:content', this.doc.updateLastEdited)
      .on('change:public', this.doc.updateLastEdited)
      .on('change:content', this.doc.updateTitle)
      .on('change:id', this.handlePrevious)
      .on('change:id', this.setUrl)
      .on('change', this.updateDocs)

    this.app = new AppView({
      litewrite: this,
      remote: connection.publicDocuments,
      model: this.doc,
      collection: this.docs
    })

    if (connection.onError) {
      this.docs.fetch({
        success: this.loadDoc,
        error: (docs, error) => connection.onError(error)
      })
    } else {
      this.state.fetch().always(() => this.docs.fetch().always(this.loadDoc))
    }
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
    if (this.useHistory) Backbone.history.navigate(doc.getUrl())
  }

})

module.exports = Litewrite
