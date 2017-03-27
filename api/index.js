const env = process.env.NODE_ENV || 'development';
const path = require("path");
const fs = require('fs');

const sourceFolder = "./src";
const entryFile = `${sourceFolder}/index`;
let mode = 0;

if (!process.env.DOCKER) {
  // Load .dev-env file
  require('dotenv').config({path: path.join(__dirname,'./.dev-env')});
}

if((process.env.EXEC_MODE == 0 || mode === 0) && process.env.APP_PORT != 0){
  let app = require(path.join(__dirname, entryFile)).https;
  app.listen(process.env.APP_PORT, console.log('API is ready -> https://127.0.0.1:%s',process.env.APP_PORT));
} else if (process.env.EXEC_MODE == 2) {
  let app = require(path.join(__dirname, entryFile)).http;
  app.listen(process.env.APP_PORT, console.log('API is ready -> http://127.0.0.1:%s', process.env.APP_PORT));
} else {
  console.error('\r\nNo viable EXEC_MODE env variable found. \r\n');
}
