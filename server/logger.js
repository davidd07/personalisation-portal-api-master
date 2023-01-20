const winston = require('winston');
const SplunkStreamEvent = require('winston-splunk-httplogger');
const NewrelicWinston = require('newrelic-winston');

const config = require('./config');

const LOG_LEVELS = {
	ERROR: 'error',
	WARN: 'warn',
	INFO: 'info',
	VERBOSE: 'verbose',
	DEBUG: 'debug'
};

let logger;
if (config.ENVIRONMENT !== 'local') {
	logger = winston.createLogger({
		level: LOG_LEVELS.INFO,
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json()
		),
		transports: [
			new SplunkStreamEvent({splunk: config.splunk}),
			new NewrelicWinston(config.newrelic)
		]
	});
} else {
	logger = winston.createLogger({
		level: LOG_LEVELS.INFO,
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json()
		),
		transports: [
			new winston.transports.Console()
		]
	});
}

// output to the log if not in production
if (config.ENVIRONMENT !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.combine(
			// customFormat,
			winston.format.colorize(),
			winston.format.timestamp(),
			winston.format.printf(info => {
				const {
					timestamp, level, message, stack, ...args
				} = info;

				const ts = timestamp.slice(0, 19).replace('T', ' ');
				let output = `${ts} [${level}]: ${message ? message : ''}\n${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
				if (stack) {
					output += `\nStacktrace: ${stack}`;
				}
				return output;
			})
		)
	}));
}

module.exports = {
	logger,
	LOG_LEVELS
};