require('dotenv').config();

module.exports = {
	ENVIRONMENT: 							process.env.ENVIRONMENT,
	SERVER_HOSTNAME: 						process.env.SERVER_HOSTNAME,
	SERVER_PORT: 							parseInt(process.env.SERVER_PORT)
};
