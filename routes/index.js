const apiRoutes = require('./api');

const init = server => {
	server.use('/api', apiRoutes);
	server.get('/', (req,res) => {
		res.send('root has been reached')
	})
};

module.exports.init = init;