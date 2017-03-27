const winston = require('winston');

var customLevels = {
  levels: {
    crit: 0,
    alert: 1,
    warn: 2,
    info: 3,
    debug: 4
  },
  colors: {
    crit: 'red',
    alert: 'yellow',
    warn: 'magenta',
    info: 'green',
    debug: 'grey'
  }
};

var logger = new winston.Logger({
  levels: customLevels.levels,
  colors: customLevels.colors,
  transports: [
    new winston.transports.Console({
      colorize: true,
      level: 'debug'
    })
  ]
});

module.exports = { logger }
