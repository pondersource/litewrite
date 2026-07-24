const $ = require('jquery')
const _ = require('underscore')
const translations = require('./translations')

const utils = {}

utils.isMac = /Mac/.test(navigator.platform)

function setModes () {
  // Keep in sync with value in litewrite.css
  utils.isMobile = window.matchMedia('(max-width:1024px)').matches
  utils.isDesktop = !utils.isMobile
}

$(window).on('resize', setModes)
setModes()

// For more info:
// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
utils.escapeRegExp = function (str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// in seconds
const hour = 3600
const day = 24 * hour
const week = 7 * day
const month = 30.4 * day
const year = 365 * day

const quantifiers = [
  {
    name: 'yearsAgo',
    time: year
  },
  {
    name: 'monthsAgo',
    time: month
  },
  {
    name: 'weeksAgo',
    time: week
  },
  {
    name: 'daysAgo',
    time: day
  },
  {
    name: 'hoursAgo',
    time: hour
  },
  {
    name: 'minutesAgo',
    time: 60
  },
  {
    name: 'secondsAgo',
    time: 1
  }
]

utils.timeAgo = function (date) {
  const diff = (Date.now() - date) / 1000 // in seconds

  const quantifier = _.find(quantifiers, function (q) {
    return diff >= q.time
  })

  if (!quantifier) {
    return
  }

  const count = Math.round(diff / quantifier.time)
  return translations[quantifier.name](count)
}

utils.registerServiceWorker = function () {
  const Workbox = require('workbox-window').Workbox
  const wb = new Workbox('service-worker.js')

  wb.addEventListener('waiting', function () {
    if (!window.confirm(translations.updateCache)) return
    wb.addEventListener('controlling', function () {
      window.location.reload()
    })
    wb.messageSkipWaiting()
  })

  wb.register()
}

utils.hotKey = utils.isMac ? 'Alt' : 'Ctrl'

module.exports = utils
