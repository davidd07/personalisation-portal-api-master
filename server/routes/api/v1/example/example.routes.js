const {checkSchema} = require('express-validator/check');

const controllerHandler = require('../../../_handler');
const ExampleController = require('../../../../controllers/example.controller');
const validationSchemas = require('./example.request-validations');

module.exports = (router) => {

	router.get('/test',
		controllerHandler(ExampleController.test, (req, res, next) => [])
	);

	router.get('/test/:name',
		checkSchema(validationSchemas.testOne),
		controllerHandler(ExampleController.testOne, (req, res, next) => [{
			name: req.params.name
		}])
	);

	router.post('/test',
		checkSchema(validationSchemas.testTwo),
		controllerHandler(ExampleController.testOne, (req, res, next) => [{
			name: req.body.name
		}])
	);

};
