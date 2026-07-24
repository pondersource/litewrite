const Backbone = require('backbone')

const Router = Backbone.Router.extend({
  initialize: function (options) {
    this.litewrite = options.litewrite
  },

  routes: {
    // Use ! for urls to not conflict with remotestorage's #access_token parameter
    '!:url': 'open',
    '*404': 'openFirst'
  },

  openFirst: function () {
    this.litewrite.open()
  },

  open: function (url) {
    const match = url.match(/^\((.+?)\)/)
    if (!match) {
      this.openFirst()
      return
    }

    const id = match[1]
    if (!id) {
      this.openFirst()
      return
    }

    this.litewrite.open(id)
  }

})

module.exports = Router
