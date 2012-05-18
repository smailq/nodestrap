require 'coffee-script'

# HTTP framework
express = require 'express'
# Underscore utils
_ = require('underscore')._
# Configuration Management
nconf = require 'nconf'
nconf.use 'file', { file: 'config.json' }

# Logging
winston = require 'winston'

# Frontend logger
winston.loggers.add 'frontend',
  console:
    colorize: 'true'
    timestamp: true
  
# Backend logger
winston.loggers.add 'backend',
  console:
    colorize: 'true'
    timestamp: true

# MySQL logger
winston.loggers.add 'mysql',
  console:
    colorize: 'true'
    timestamp: true

logger = winston.loggers.get 'frontend'

# Styler
eco = require 'eco'

# PooledMySQLClient
pooledMysqlClient = require('./pooledmysql')({ nconf: nconf, logger: winston.loggers.get 'mysql' })

# Initialize backend with configs and logger
backend = require('./backend')({ nconf: nconf, logger: winston.loggers.get('backend'), mysqlClient: pooledMysqlClient })

# Main app
app = module.exports = express.createServer()

# TODO: CSRF protection

app.configure ->
  app.set 'views', __dirname + nconf.get 'viewFiles'
  app.set 'view engine', 'eco'

  app.use(express.cookieParser { secret: 'eFHh@OhoFhO@H@O*28!*Y$%(Y3RGH' })
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.session { secret: 'jhfwbeu2@090uDoih2N)()(*&@Ufdifu' } )

  app.use '/static/', express.static __dirname + nconf.get 'staticFiles'
  app.use(app.router)

#
# TODO: Error Handling
#
# app.error (err, req, res, next) ->


#
# Dynamic Stuff
#
app.get '/', (req, res, next) ->
  res.render 'index'


# Start!
app.listen nconf.get 'port'
logger.info 'Server listening at ', nconf.get 'port'
