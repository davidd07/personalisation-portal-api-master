
module.exports.testOne = {

	name: {
		in: ['params'],
		exists: {
			errorMessage: 'Name required'
		},
		isLength: {
			errorMessage: 'Name required',
			options: { min: 1 }
		}
	}

};

module.exports.testTwo = {

	name: {
		in: ['body'],
		exists: {
			errorMessage: 'Name required'
		},
		isLength: {
			errorMessage: 'Name required',
			options: { min: 1 }
		}
	}

};