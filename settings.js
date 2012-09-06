var stylus = require('stylus');

/**
 * @param app - the express application
 * @param express - the express library
 * @param nconf - the configuration settings
 * @param winston - the logger
 */
module.exports = function(app, express, nconf, winston) {
  app.configure(function(){

    // Set html as default extension
    app.set('view engine', 'html');

    // Use ./views/layout.html as the root of all views
    app.set('layout', 'layout');

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

    // last handler; assume 404 at this point 
    // app.use(utils.render404);
  });

  app.configure('development', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    app.use(express.errorHandler());
    app.set('napkin', 0);
  });
};