path = require('path')
root = path.resolve(path.join(__dirname, 'src'))
module.exports = {
	module: {
		loaders: [
			{ test: /\.ls$/, loader: 'livescript?map=none' }
		]
	}
	,resolve: {
		root: root
		,extensions: ['', '.ls', '.js']
	}
};
