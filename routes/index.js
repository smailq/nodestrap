var utils = require('../lib/utils');

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

};
