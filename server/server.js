var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var app = module.exports = loopback();
var http = require('http');
var https = require('https');
var sslConfig = require('./ssl-config');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
/*
 * body-parser is a piece of express middleware that
 *   reads a form's input and stores it as a javascript
 *   object accessible through `req.body`
 *
 */
var bodyParser = require('body-parser');
// Create an instance of PassportConfigurator with the app instance
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// Set up the /favicon.ico
app.use(loopback.favicon());

// request pre-processing middleware
app.use(loopback.compress());

// -- Add your pre-processing middleware here --

// boot scripts mount components like REST API
boot(app, __dirname);
// attempt to build the providers/passport config
var config = {};
try {
  config = require('./providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1); // fatal
}
// Enable http session
//app.use(loopback.cookieParser(app.get('echo')));
app.use(loopback.session({
  secret: 'echo',
  saveUninitialized: true,
  resave: true,
  rolling: true,
  cookie: {maxAge: 10000}
}));
app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

// The access token is only available after boot
app.use(loopback.token({
  model: app.models.accessToken
}));

passportConfigurator.init();

passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
  roleModel: app.models.role,
  roleMappingModel: app.models.RoleMapping
});

for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

app.get('/', ensureLoggedIn('/auth/adfs'), function (req, res, next) {
  res.redirect('/app');
});

app.get('/auth/account', ensureLoggedIn('/auth/adfs'), function (req, res, next) {
  res.render('pages/loginProfiles', {
    user: req.user,
    url: req.url
  });
});

app.get('/local', function (req, res, next) {
  res.render('pages/local', {
    user: req.user,
    url: req.url
  });
});

app.get('/signup', function (req, res, next) {
  res.render('pages/signup', {
    user: req.user,
    url: req.url
  });
});

app.get('/login', function (req, res, next) {
  res.render('pages/login', {
    user: req.user,
    url: req.url
  });
});

app.get('/auth/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

app.get('/hello', function(req,res){
  console.log("hello back");
  res.send('hello back');
});

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
app.use(loopback.static(path.resolve(__dirname, '../client')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function (httpOnly) {
  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }
  var server = null;
  if (!httpOnly) {
    var options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }

  server.listen(/*app.get('port')*/(process.env.PORT || app.get('port')), function () {
    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + (process.env.PORT || app.get('port'));
    app.emit('started', baseUrl);
    console.log('Server listening @ %s%s', baseUrl, '/');
  });
  return server;
};

// start the server if `$ node server.js`
/*if (require.main === module) {
  app.start();
}
*/
app.start();
