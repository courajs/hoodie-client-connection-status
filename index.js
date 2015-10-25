module.exports = Connection

var EventEmitter = require('events').EventEmitter

var check = require('./lib/check')
var getOk = require('./lib/get-ok')
var on = require('./lib/on')
var off = require('./lib/off')

var parseOptions = require('./lib/utils/parse-options')
var getCache = require('./lib/utils/cache').get

function Connection (options) {
  var state = parseOptions(options)
  var cached = getCache(state)

  state.emitter = new EventEmitter()

  if (cached) {
    var cachedTime = +new Date(cached.timestamp)
    var currentTime = +new Date()
    if (state.cache.timeout && currentTime >= cachedTime + state.cache.timeout) {
      process.nextTick(function () {
        state.emitter.emit('reset', cached)
      })
    } else {
      state.error = cached.error
      state.timestamp = cached.timestamp
    }
  }

  return {
    get ok () {
      return getOk(state)
    },
    check: check.bind(null, state),
    on: on.bind(null, state),
    off: off.bind(null, state)
  }
}
