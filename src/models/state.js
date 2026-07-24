const Backbone = require('backbone')
const Store = require('backbone.localstorage')

const State = Backbone.Model.extend({
  defaults: {
    id: 0,
    query: ''
  },

  localStorage: new Store('litewriteState')
})

module.exports = State
