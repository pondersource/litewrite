const _ = require('underscore')
const Backbone = require('backbone')
const lang = require('../translations')

const EntriesView = Backbone.View.extend({
  el: '#entries',

  initialize: function (options) {
    _.bindAll(this, 'filter', 'render', 'update', 'toTop', 'removeItem', 'selectDoc', 'openFirst')

    this.litewrite = options.litewrite

    this.collection
      .on('add reset', this.render)
      .on('change:title', this.update)
      .on('change:lastEdited', this.toTop)
      .on('remove', this.removeItem)

    this.litewrite.doc
      .on('change:id', this.selectDoc)

    this.litewrite.state
      .on('change:query', this.render)
      .on('change:query', this.openFirst)
  },

  events: {
    'click .item': 'openDoc'
  },

  filter: function (doc) {
    const query = this.litewrite.state.get('query')
    if (!query) {
      return true
    }
    return doc.get('content').toLowerCase().indexOf(query.toLowerCase()) !== -1
  },

  render: function () {
    const items = document.createDocumentFragment()
    for (const doc of this.collection.filter(this.filter)) {
      const item = document.createElement('li')
      item.className = 'item'
      item.dataset.id = doc.id
      const link = document.createElement('a')
      link.href = '#!' + doc.getUrl()
      link.style.opacity = doc.getOpacity()
      link.textContent = doc.get('title') || lang.emptyDoc
      item.append(link)
      items.append(item)
    }
    this.el.replaceChildren(items)
    this.selectDoc()
  },

  find: function (id) {
    return this.$('.item[data-id=' + id + ']')
  },

  // Update text and href for a doc
  update: function (doc) {
    const $item = this.find(doc.id).find('a')
    if (!$item.length || doc.isEmpty()) {
      this.render()
      return
    }
    $item.text(doc.get('title'))
    $item.attr('href', '#!' + doc.getUrl())
  },

  // Moves a doc from its current position to the top of the list
  toTop: function (doc) {
    const $item = this.removeItem(doc)
    $item.children('a').css('opacity', 1)
    this.$el.prepend($item)
  },

  removeItem: function (doc) {
    return this.find(doc.id).remove()
  },

  // Add a 'selected' class to the open doc
  selectDoc: function () {
    if (this.$selected) {
      this.$selected.removeClass('selected')
    }
    this.$selected = this.find(this.litewrite.doc.id)
      .addClass('selected')
  },

  selectedFirst: function () {
    return this.$selected.attr('data-id') === this.collection.first().id
  },

  // Event handler to open a document
  openDoc: function (e) {
    e.preventDefault()

    const id = this.$(e.currentTarget).attr('data-id')
    this.litewrite.open(id)
    this.trigger('open')
  },

  openFirst: function () {
    const id = this.$('.item').attr('data-id')
    this.litewrite.open(id)
  },

  previous: function (id) {
    return this.find(id).prev().attr('data-id')
  },

  next: function (id) {
    return this.find(id).next().attr('data-id')
  }

})

module.exports = EntriesView
