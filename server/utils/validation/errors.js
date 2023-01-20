const {logger, LOG_LEVELS} = require('../../logger');

class ErrorWithMetadata extends Error {
	constructor (message, meta={}, logLevel=LOG_LEVELS.ERROR) {
		super(message);

		// this.debug = this;
		this.type = this.constructor.name;

		this.message = message;
		this.meta = meta;
		this.customProps = {};
	}
}

class RequestValidationError extends ErrorWithMetadata {

	constructor (message, meta={}) {
		const logLevel = LOG_LEVELS.VERBOSE;

		super(message, meta, logLevel);

		this.customProps = {
			...this.customProps,
			logLevel,
			statusCode: 422,
			statusType: 'fail',
			errorDisplay: {
				errors: this.meta.errors.mapped()
			}
		};
	}
}

class TestError extends ErrorWithMetadata {

	constructor (message, meta={}) {
		const logLevel = LOG_LEVELS.VERBOSE;

		super(message, meta, logLevel);

		this.customProps = {
			...this.customProps,
			logLevel,
			statusCode: 500,
			statusType: 'fail',
			errorDisplay: {
				message: 'Nooooo this has failed!'
			}
		};
	}
}


module.exports = {
	RequestValidationError,
	TestError
};

