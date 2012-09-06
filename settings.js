var stylus = require('stylus');
var utils = require('./lib/utils');
/**
 * @param app - the express application
 * @param express - the express library
 * @param nconf - the configuration settings
 * @param winston - the logger
 */
module.exports = function(app, express, nconf, winston) {

  // settings for development environment
  app.configure('development', function() {

    // log
    app.use(express.logger({
      format: 'dev'
    }));

  });

  // settings for production environment
  app.configure('production', function() {

    // setup access logs
    // @see https://github.com/flatiron/winston
    winston.loggers.add('access', {
      file: {
        filename: './logs/access.log',
        json: false,
        maxsize: 67108864
      }
    });

    var winston_access = winston.loggers.get('access');
    winston_access.remove(winston.transports.Console);

    // enable web server logging; pipe those log messages through winston
    var winstonStream = {
      write: function(message, encoding){
          // get rid of newline char
          winston_access.info(message.slice(0,-1));
      }
    };

    /**
      log
    
      For format syntax, see below
      @see http://www.senchalabs.org/connect/logger.html
    **/
    app.use(express.logger({
      format: ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time',
      stream: winstonStream
    }));

  });

  // configure express
  app.configure(function(){

    // Set html as default extension
    app.set('view engine', 'html');

    // Use ./views/layout.html as the root of all views
    app.set('layout', 'global/layout');

    // Partials for layout
    app.set('partials', {
      "_google_analytics": "3rd_party/google_analytics",
      "_top_nav": "global/top_nav",
      "_footer": "global/footer"
    });

    // Where to find view files
    app.set('views', __dirname + '/views');

    // Enable view caching
    app.enable('view cache');
    
    // Register hogan
    app.engine('html', require('hogan-express'));

    /**
      Parse request bodies, supports application/json,
      application/x-www-form-urlencoded, and multipart/form-data.

      @see http://www.senchalabs.org/connect/bodyParser.html
    **/
    app.use(express.bodyParser());

    /**
      Provides faux HTTP method support.
     
      Pass an optional key to use when checking for
      a method override, othewise defaults to _method.

      ex)  express.methodOverride('method_override')

      searches request body for the key first, if not, 
      it checks for X-HTTP-Method-Override header.

      @see http://www.senchalabs.org/connect/methodOverride.html
    **/
    app.use(express.methodOverride());

    /**
      Parse Cookie header and populate req.cookies
      with an object keyed by the cookie names. Optionally
      you may enabled signed cookie support by passing
      a secret string, which assigns req.secret so
      it may be used by other middleware.

      @see http://www.senchalabs.org/connect/cookieParser.html
    **/
    app.use(express.cookieParser(nconf.get('cookie_secret')));

    /**
      Setup session store with the given options.

      Session data is not saved in the cookie itself, however
      cookies are used, so we must use the cookieParser()
      middleware before session().

      @see http://www.senchalabs.org/connect/session.html
    **/
    app.use(express.session( { secret: nconf.get('session_secret') }));

    // Serve favicon
    // @see http://www.senchalabs.org/connect/favicon.html
    app.use(express.favicon());

    /**
      Setup stylus.

      All *.styl files under ./public/ will be compiled to .css file
      when request is made to *.css

      @see http://learnboost.github.com/stylus/
    **/
    app.use(stylus.middleware({
      src: __dirname + '/public',
      dest: __dirname + '/public',
      compile: function(str, path, fn) {
        return stylus(str)
          .set('filename', path)
          .set('compress', true)
          .set('warn', false);
      }
    }));
    
    /**
      Serve static files.

      Note that some files might be better off served with
      a wrapper web server like apache or nginx.
    **/
    app.use(express.static(__dirname + '/public'));

    // Try to process the request with routes defined in ./routes
    app.use(app.router);

  });

  // settings for development environment
  app.configure('development', function() {

    // handle error
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));

  });

  // settings for production environment
  app.configure('production', function() {

    // 404
    app.use(utils.render404);

    // handle error
    app.use(express.errorHandler());
  });
};
