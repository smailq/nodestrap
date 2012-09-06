/**
 * @param app - the express application
 * @param nconf - the configuration settings
 * @param winston - logger
 */
module.exports = function(app, nconf, winston) {
  
  // landing page
  app.get('/', function(request, response) {
    response.render("index");
  });

  /**
   * Finds which URL to redirect to given a request.
   */
  function getRedirect(request) {
    var redirect = request.query.redirect;
    redirect = redirect || request.headers.referer;
    return redirect || '/'; // default to home page
  }

};
