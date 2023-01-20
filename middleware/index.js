const setServerEnvironment = ({ server, config }) => {
	server.set('env', config.ENVIRONMENT);
	server.set('hostname', config.SERVER_HOSTNAME);
	server.set('port', config.SERVER_PORT);
};

const enableCookieParser = ({ server }) => {
	const cookieParser = require('cookie-parser');
	server.use(cookieParser());
};

const enableBodyParser = ({ server }) => {
	const bodyParser = require('body-parser');
	server.use(bodyParser.json({limit:'1mb'}));
	server.use(bodyParser.urlencoded({extended: false, limit:'1mb'}));
};

const enableExpressValidator = ({ server }) => {
	const validator = require('express-validator');
	server.use(validator());
};

const enableHelmet = ({ server }) => {
	const helmet = require('helmet');

	server.use(helmet());
};

const enableCORS = ({ server }) => {
	const cors = require('cors');
	// allow cross-domain cookies to be sent by allowing dynamic `Access-Control-Allow-Origin`
	// cross-domain AJAX requests cannot be sent using `credentials` if `Access-Control-Allow-Origin` is `*`
	server.use(cors({
		origin: function (origin, callback) {
			callback(null, origin);
		},
		credentials: true
	}));
	server.use((req, res, next) => {
		// res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials, Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
};

const initRoutes = ({ server }) => {
	const routes = require('../routes');

	routes.init(server);
};

const initErrorHandling = ({ server }) => {
	const initErrorHandling = require('./errors.middleware');
	initErrorHandling({ server });
};

const init404Handler = ({ server }) => {
	server.use((req, res) => {
		res.status(404).json({
			status: 'error',
			message: '404 not found'
		});
	});
};

const logRequests = ({ server }) => {
	const uuid = require('uuid');
	const {logger, LOG_LEVELS} = require('../logger');

	server.use((req, res, next) => {
		const uid = uuid();

		logger.log(LOG_LEVELS.INFO, {
			type: 'response_start',
			uuid: uid
		});

		req.uuid = uid;

		const cleanup = () => {
			res.removeListener('finish', onFinish);
		};

		const onFinish = () => {
			logger.log(LOG_LEVELS.INFO, {
				type: 'response_end',
				uuid: uid
			});
			cleanup();
		};

		res.on('finish', onFinish);

		next();
	});
};

module.exports = ({ server, config }) => {
	setServerEnvironment({ server, config });

	enableCookieParser({ server, config });

	enableBodyParser({ server, config });

	enableExpressValidator({ server, config });

	enableHelmet({ server, config });

	enableCORS({ server, config });

	logRequests({ server, config });

	initRoutes({ server, config });

	initErrorHandling({ server, config });

	init404Handler({ server, config });
};