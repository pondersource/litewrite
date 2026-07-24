const Backbone = require('backbone')
const _ = require('underscore')
const EntriesView = require('./entries')
const EditorView = require('./editor')
const DateView = require('./date')
const AsideView = require('./aside')
const SearchView = require('./search')
const ShareView = require('./share')
const DeleteView = require('./delete')
const utils = require('../utils')

// Enable search if at least this number of documents
const searchMinDocCount = 10

const AppView = Backbone.View.extend({
  el: 'body',

  initialize: function (options) {
    _.bindAll(this, 'toggleSearch')

    this.litewrite = options.litewrite

    this.editor = new EditorView({ model: this.model, litewrite: this.litewrite })
    this.aside = new AsideView({ model: this.model, collection: this.collection })
    this.search = new SearchView({ model: this.litewrite.state })
    this.entries = new EntriesView({ litewrite: this.litewrite, collection: this.collection })
    this.date = new DateView({ model: this.model })
    const deleteView = new DeleteView({ model: this.model })
    const share = new ShareView({ model: this.model, collection: this.collection, remote: options.remote })

    this.litewrite
      .on('ready', this.editor.render)
      .on('ready', this.editor.desktopFocus)
      .on('connected', share.show)
      .on('disconnected', share.hide)

    this.collection
      .on('update', this.toggleSearch)

    this.search
      .on('focus', this.aside.show)
      .on('blur', this.editor.desktopFocus)

    this.editor
      .on('typing', this.aside.desktopHide)

    this.aside
      .on('opening', this.editor.blur)

    this.entries
      .on('open', this.editor.desktopFocus)
      .on('open', this.aside.hide)

    deleteView
      .on('delete', this.editor.render)
      .on('delete', this.editor.focus)
      .on('delete', share.unshare)
  },

  events: {
    'click #add': 'newDoc',
    'touchend #add': 'newDoc',
    'click #menu-button': 'toggleAside',
    'touchend #menu-button': 'toggleAside',
    keydown: 'handleKey',
    keyup: 'closeAside'
  },

  newDoc: function () {
    if (utils.isMobile) {
      this.aside.hide()
    }
    if (!this.model.isEmpty()) {
      this.collection.addNew()
    }
    this.editor.focus()
    this.search.clear()
    return false
  },

  toggleAside: function () {
    this.aside.toggle()
    return false
  },

  toggleSearch: function () {
    if (this.collection.length >= searchMinDocCount) {
      this.search.show()
    } else {
      this.search.hide()
    }
  },

  // Global key handler for shortcuts
  handleKey: function (e) {
    const tabKey = e.keyCode === 9

    const sKey = e.keyCode === 83
    const saveShortcut = sKey && e.metaKey

    if (tabKey && !e.shiftKey) {
      this.editor.insertTab()
    }

    if (tabKey || saveShortcut) {
      e.preventDefault()
      return
    }

    const hotKey = (utils.isMac && e.altKey) || e.ctrlKey
    if (!hotKey) return

    const shortcut = this.shortcuts[e.keyCode]
    if (!shortcut) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    shortcut.call(this, e)
  },

  shortcuts: {
    32: function space () {
      this.aside.toggle()
    },
    68: function d () {
      this.newDoc()
    },
    38: function up () {
      this.previous()
    },
    40: function down () {
      this.next()
    },
    70: function f () {
      this.search.focus()
    }
  },

  previous: function () {
    const id = this.entries.previous(this.model.id)
    if (id) {
      this.litewrite.open(id)
    }
  },

  next: function () {
    const id = this.entries.next(this.model.id)
    if (id) {
      this.litewrite.open(id)
    }
  },

  closeAside: function (e) {
    const isModKey = e.keyCode === 18
    if (!isModKey) {
      return
    }
    if (this.search.isFocused()) {
      return
    }
    this.aside.hide()
  }

})

module.exports = AppView
