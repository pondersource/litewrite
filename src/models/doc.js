const _ = require('underscore')
const Backbone = require('backbone')
const rsSync = require('rs-adapter')
const timeAgo = require('../utils').timeAgo

const Doc = Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    lastEdited: null,
    public: null,
    cursorPos: 0
  },

  sync: rsSync,

  isEmpty: function () {
    return this.get('content').trim() === ''
  },

  // Only update lastEdited if you didn't switch the document
  updateLastEdited: function (doc) {
    if (!doc.changed.id) {
      doc.set('lastEdited', new Date().getTime())
    }
  },

  // Title consists of the first 40 characters of the first not empty line
  updateTitle: function (doc) {
    const matchTitle = doc.get('content').match(/[^\s].{0,40}/)
    doc.set('title', matchTitle ? matchTitle[0] : '')
  },

  getUrl: function () {
    const title = this.get('title')
      .toLowerCase()
      .replace(/\s|&nbsp;/g, '-')
      .replace(/"|’|'|,|\//g, '')
    return title ? '!' + '(' + this.id + ')-' + encodeURI(title) : ''
  },

  getOpacity: function () {
    // Time passed since this document was edited the last time in milliseconds
    const diff = new Date().getTime() - this.get('lastEdited')
    // The older the document the smaller the opacity
    // but the opacity is allway between 0.4 and 1
    // For documents older than 3 months the opacity won't change anymore
    const limit = 90 * 86400000
    const opacity = diff > limit ? 0.4 : Math.round((0.4 + ((limit - diff) / limit) * 0.6) * 100) / 100
    return opacity
  },

  // send updates at most once per second to remotestorage
  throttledSave: _.throttle(function () {
    this.save()
  }, 1000),

  formatDate: function () {
    return timeAgo(this.get('lastEdited'))
  }

})

module.exports = Doc
