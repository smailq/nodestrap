mysql = require 'mysql'
poolModule = require 'generic-pool'


class PooledMySQLClient
  constructor: (@nconf, @logger) ->

    self = @

    @mysql_pool = poolModule.Pool {
      name: 'mysql'
      
      create: (callback) ->
        client = mysql.createClient({
          user: self.nconf.get 'mysql:user'
          password: self.nconf.get 'mysql:password'
          database: self.nconf.get 'mysql:production'
        }).on 'error', (err) ->
          self.logger.error 'MySQLPoolCreate', err
          callback err

        callback null, client

      destroy: (client) ->
        client.end()

      max : 5

      idleTimeoutMillies : 30000

      log : (message, level) ->
        self.logger level, message
    }

  query: (query, fieldValues, cb) ->

    self = @

    self.mysql_pool.acquire (err, client) ->
      if err
        self.logger.error 'MySQLPool', err
        cb err
      else
        client.query query, fieldValues, (err, results, fields) ->
          self.mysql_pool.release client

          if err
            self.logger.error 'MySQLPool', err
            cb err
          else
            cb null, results, fields

  query_simple : (query, fields, cb) ->

    @query query, fields, (err, results) ->
      cb null, results if err? else cb err


module.exports = (opts) ->

  # External configuration and logger object is required
  
  if not opts.nconf or not opts.logger
    throw new Error 'nconf and logger options are required.'
  
  new PooledMySQLClient(opts.nconf, opts.logger)



###

PooledMySQLClient.prototype.query_simple = function (query, fields, cb) {
  
  var self = this;
  
  self.query(query, fields, function(err, results) {
    
    if (err) {
      cb(err);
    } else {
      cb(null, results);
    }
    
  });

};

PooledMySQLClient.prototype.query_aff_rows = function (query, fields, cb) {
  
  var self = this;

  self.query(query, fields, function(err, results) {
    
    if (err) {
      cb(err);
    } else {
      cb(null, results.affectedRows > 0);
    }
    
  });

};

PooledMySQLClient.prototype.query_get_one = function (query, fields, cb) {
  
  var self = this;
  
  self.query(query, fields, function(err, results) {
    
    if (err) {
      cb(err);
    } else {
      cb(null, results.shift());
    }
            
  });

};
###





