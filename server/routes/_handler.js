const { validationResult } = require('express-validator/check');
const ErrorTypes = require('../utils/validation/errors');

/**
 * Handles controller execution and responds to user (API Express version).
 * Web socket should have a similar handler implementation.
 *
 * @param promise           Controller Promise method
 * @param params            A function (req, res, next), all of which are optional that maps desired controller parameters
 *
 * @example router.get('claim/:claimNumber', controllerHandler(ClaimController.getClaim, (req, res, next) => [req.params.claimNumber]));
 */
const controllerHandler = (promise, params) => async (req, res, next) => {
	const boundParams = params ? params(req, res, next) : [];
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			throw new ErrorTypes.RequestValidationError('Validation failed', { errors: errors });
		}

		const result = await promise(...boundParams);
		return res.json({
			status: 'success',
			data: result
		} || { status: 'success', message: 'ok' });
	} catch (error) {
		return next(error);
	}
};

module.exports = controllerHandler;