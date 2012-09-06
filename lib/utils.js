/**
 * Render a 404 response page.
 *
 * @param request - the web request object
 * @param response - the web response object
 */
exports.render404 = function(request, response) {
  response.status(404);
  response.render('not-found');
};

// no operation placeholder for empty callbacks
exports.noOperation = function() {};

/**
 * Finds which URL to redirect to given a request.
 */
exports.getRedirect = function(request) {
  var redirect = request.query.redirect;
  redirect = redirect || request.headers.referer;
  return redirect || '/'; // default to home page
}
