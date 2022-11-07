"use strict";
require('dotenv').config();

const PORT = process.env.PORT || 6502
const TEST = (process.argv.indexOf("test") > -1)

const express   = require('express');
const https     = require("https");
const fs        = require("fs");
const cert_path = "./certs/";
const Feed      = require('./hashtag');

// add timestamps in front of log messages
require( 'console-stamp' )( console, { pattern: 'dd/mm/yyyy HH:MM:ss '},"Serv:" );

function log(l){console.log(l)}

var app = express();
var emulators = 0;
var served = 0;

app.get('/pop', (req, res) => {
  if (req.client.authorized) {
    var toot = tootFeed.pop();
    res.send(toot);
    if (TEST && toot.text == null) {process.exit()};
  }
})

app.get('/quit', (req, res) => {
  if (req.client.authorized) {
    process.exit();
  }
})

var options = {
  key: fs.readFileSync(cert_path+'server_key.pem'),
  cert: fs.readFileSync(cert_path+'server_cert.pem'),
  ca: [ fs.readFileSync(cert_path+'server_cert.pem') ],
  requestCert: true,
  rejectUnauthorized: true
};

var listener = https.createServer(options, app).listen(PORT, function () {
  console.log('BBC Micro Bot toot server listening on port ' + listener.address().port);
});

// Poll the twitter mentions
var tootFeed = new Feed();
tootFeed.update();
setInterval(function(){ tootFeed.update(); }, 12500);
