# Web framework
express = require 'express'
# Templating language
jade = require 'jade'
# Dynamic CSS
stylus = require 'stylus'
# String validation
validator = require 'validator'
# Misc. utils
_ = require 'underscore'
# Logger
winston = require 'winston'
# Configuration management
nconf = require 'nconf'

# Configure 'nconf'
nconf.argv().env()
# Environment specific configs
if process.env.NODE_ENV? and process.env.NODE_ENV != ""
  nconf.add 'user',
    type:'file'
    file: './configs/' + process.env.NODE_ENV + '.json'
# Default config
nconf.add 'global',
  type:'file'
  file: './configs/defaults.json'

# Set winston to write logs to file if 'logFile' is defined
if nconf.get('logFile')?
  winston.add winston.transports.File, { filename: nconf.get('logFile') }
  winston.remove winston.transports.Console

# Setup express
app = express()
# Don't forget the favicons!
app.use express.favicon('static/favicon.ico')
# If cookies are used, encrypt them!
app.use express.cookieParser(nconf.get('cookieSecret'))
# Session vars are nice, but personally not a fan.
# Try to use Redis, memcached, or other independant solutions.
#app.use express.cookieSession()
# Parse body
app.use express.bodyParser()
# asset pipeline
app.use require('connect-assets')()
# Static files (on prod, have web servers serve these)
app.use '/static', express.static __dirname + '/static'
# Setup jade template views
app.set 'views', __dirname + '/views'
app.set 'view engine', 'jade'
app.set 'view options', layout: false

# Set locals for global template context
app.use (req,res,next) ->
  res.locals.env = process.env.NODE_ENV
  next()

# Landing page
app.get '/', (req, res, next) ->
  res.render 'pages/landing'

# Demonstrate unhandled exceptions
app.get '/throw', (req, res, next) ->
  throw new Error('handles exceptions!')

# Demonstrate next(err)
app.get '/next_err', (req, res, next) ->
  err = new Error('something happened')
  err.extra_data = 
    foo: 'bar'
    bar: 'foo'
  err.status = 503
  next err

# Not found if reached here
app.use (req, res, next) ->
  res.status 404
  res.render '404'

# Error Handling
app.use (err, req, res, next) ->
  res.status(err.status || 500)
  res.render '500'
  # Log stuff
  winston.error err.message, {"module": "web", "error": err, "headers": req.headers}

# Start Web Server
app.listen nconf.get('port'), ->
  winston.info "Server is up and running!", { "port" : nconf.get('port') }
