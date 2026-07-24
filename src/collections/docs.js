const _ = require('underscore')
const Backbone = require('backbone')
const utils = require('../utils')
const Doc = require('../models/doc')
const rsSync = require('rs-adapter')
const lang = require('../translations')
const { v4: uuid } = require('uuid')

const Docs = Backbone.Collection.extend({
  model: Doc,

  sync: rsSync,

  initialize: function (models, options) {
    _.bindAll(this, 'sort', 'save', 'welcome', 'rsChange')

    this
      .on('change:lastEdited', this.sort)
      .on('change:lastEdited', this.save)

    this.once('sync', this.welcome)

    this.remote = options.remote

    this.remote.on('change', this.rsChange)
  },

  addNew: _.throttle(function (options) {
    return this.add(_.defaults(options || {}, {
      id: uuid(),
      lastEdited: Date.now()
    }))
  }, 1000, { leading: true }),

  // Sort by 'lastEdited'
  comparator: function (first, second) {
    return first.get('lastEdited') > second.get('lastEdited') ? -1 : 1
  },

  save: function (doc) {
    doc.throttledSave()
  },

  welcome: function () {
    if (this.isEmpty()) {
      const welcomeContent = lang.welcome.replace(/{Alt}/g, utils.hotKey)
      this.addNew({ content: welcomeContent })
    }
  },

  events: [],

  rsChange: function (event) {
    this.events.push(event)
    this.handleEvents()
  },

  handleEvents: _.debounce(function () {
    _.each(this.events, function (event) {
      if (event.origin === 'window') {
        return
      }
      // Remove
      if (event.oldValue && !event.newValue) {
        this.remove(event.oldValue)
        return
      }
      // Add
      const existingDoc = this.get(event.newValue.id)
      if (!existingDoc) {
        this.add(event.newValue)
        return
      }
      // Update
      const isLatest = event.newValue.lastEdited > existingDoc.get('lastEdited')
      if (!isLatest) {
        return
      }
      this.set(event.newValue, { remove: false })
      this.trigger('remoteUpdate', event.newValue.id)
    }, this)
    this.events = []
  }, 400)

})

module.exports = Docs
