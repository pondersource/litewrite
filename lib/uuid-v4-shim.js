// Shim for the removed `uuid/v4` deep import, still used internally by the
// unmaintained remotestorage-module-documents package.
module.exports = require('uuid').v4
