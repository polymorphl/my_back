const http = require('http');
const https = require('https');
const fs = require('fs');

const socketApp = require('./socket').socketApp;
const routerApp = require('./router').routerApp;

// initialize variables
let http_server,
    https_server = null;

// boot router
const KoaApp = routerApp();

if (process.env.EXEC_MODE == 2) {
  // HTTP - Listening
  http_server = http.createServer(KoaApp.callback());
  socketApp(http_server);
} else {
  // Create the HTTPS Server
  let ssl_options = {
    key: fs.readFileSync('ssl/server.key', 'utf8'),
    cert: fs.readFileSync('ssl/server.crt', 'utf8'),
    requestCert: false,
    rejectUnauthorized: false
  };

  // HTTPS - Listening ...
  https_server = https.createServer(ssl_options, KoaApp.callback());
  socketApp(https_server);
}

// module.exports = https_server;
module.exports = {
  http: http_server,
  https: https_server
};
