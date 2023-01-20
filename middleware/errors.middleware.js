const {logger, LOG_LEVELS} = require('../logger');

/**
 * Initialises the custom error handling middleware
 *
 * @param {ExpressInstance} server			Server to initialise middleware for
 */
const initErrorHandlers = ({ server }) => {


	/**
	 * Handle custom errors
	 */
	server.use((error, req, res, next) => {

		if (error.customProps) {

			logger.log(LOG_LEVELS.ERROR, {
				...error,
				stack: this.stack,
				uuid: req.uuid,
			});

			return res.status(error.customProps.statusCode || 500).json({
				status: error.customProps.statusType || 'error',
				...error.customProps.errorDisplay || {message: 'An error occurred'}
			});
		}

		return next(error);
	});

	/**
	 * Handle default errors
	 */
	server.use((error, req, res, next) => {
		logger.log(LOG_LEVELS.ERROR, {
			...error,
			stack: this.stack,
			uuid: req.uuid,
		});

		// console.log(error)

		return res.status(500).json({
			status: 'error',
			message: 'An error occurred'
		});
	});

};


module.exports = initErrorHandlers;