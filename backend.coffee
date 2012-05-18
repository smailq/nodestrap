uuid = require 'node-uuid'
sha1 = require 'sha1'

_ = require('underscore')._

class Backend

  constructor: (@nconf, @logger, @mysqlClient) ->

    

module.exports = (opts) ->

  # External configuration and logger object is required
  
  if not opts.nconf? or not opts.logger? or not opts.mysqlClient?
    throw new Error 'nconf, logger, mysqlClient options are required.'
  
  new Backend(opts.nconf, opts.logger, opts.mysqlClient)
