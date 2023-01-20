const router = require('express').Router();
const controllerHandler = require('../../_handler');
const Controller = require('../../../controllers/experimentation');

router.post('/form',
	controllerHandler(Controller.experimentation, (req, res, next) => [{
		canvas: req.body.formsData.experimentCanvas,
		jiraForm: req.body.formsData.jiraForm
	}])
);

router.post('/form-new',
	controllerHandler(Controller.experimentationNew, (req, res, next) => [{
		canvas: req.body.formsData.experimentCanvas,
		jiraForm: req.body.formsData.jiraForm,
		authOld: req.body.formsData.auth,
		createOptions: req.body.formsData.createOptions
	}])
);

router.get('/check-jira-user/:username?',
	controllerHandler(Controller.getJiraUserName, (req, res, next) => [
		req.params.username
	])
);

router.get('/get-trello-labels',
	controllerHandler(Controller.getTrelloLabels, (req, res, next) => [
	])
);

router.get('/status-board',
	controllerHandler(Controller.statusBoard, (req, res, next) => [{
	}])
);

router.get('/test',
	controllerHandler(Controller.test, (req, res, next) => [])
);

module.exports = router;
