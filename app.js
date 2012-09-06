"use strict";
var express = require('express');
var app = express();

// Configs
var nconf = require('nconf');
nconf.argv().env().file({ file: 'local.json' });

// Logging
var winston = require('winston');

require('./settings')(app, express, nconf, winston);
require('./routes')(app, nconf, winston);

app.listen(process.env.PORT || nconf.get('port'));
