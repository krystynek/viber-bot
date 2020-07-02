const winston = require('winston');
const appRoot = require('app-root-path');

function createLogger () {
  const options = {
    file: {
      level: 'info',
      name: 'file.info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: true,
    },
    errorFile: {
      level: 'error',
      name: 'file.error',
      filename: `${appRoot}/logs/error.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: true,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

  const logger = winston.createLogger({
    level: 'debug', // We recommend using the debug level for development,
    transports: [
      new (winston.transports.Console)(options.console),
      new (winston.transports.File)(options.errorFile),
      new (winston.transports.File)(options.file),
    ],

  });

  return logger;
}

exports.createLogger = createLogger