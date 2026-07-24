const _ = require('underscore')
const Backbone = require('backbone')
const lang = require('../translations')

const updateInterval = 20000

const DateView = Backbone.View.extend({
  el: '#date',

  initialize: function (options) {
    _.bindAll(this, 'render')
    this.model.on('change:lastEdited', this.render)
    this.refreshTimeout = null
  },

  render: function () {
    const lastModified = this.model.formatDate()
    this.$el.html(lastModified ? lang.modified + ' ' + lastModified : '')
    this.refresh()
  },

  refresh: function () {
    clearTimeout(this.refreshTimeout)
    this.refreshTimeout = setTimeout(_.bind(function () {
      // Stop updating when window is inactive
      window.requestAnimationFrame(this.render)
    }, this), updateInterval)
  }

})

module.exports = DateView
