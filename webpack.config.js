path = require('path')
root = path.resolve(path.join(__dirname, 'src'))
module.exports = {
     entry: [
        path.join(__dirname, 'src/index.ls')
     ]
    ,output: {
         path: __dirname
        ,filename: 'index.js'
    }
	,module: {
		loaders: [
			{ test: /\.ls$/, loader: 'livescript?map=none' }
		]
	}
	,resolve: {
		root: root
		,extensions: ['', '.ls', '.js']
	}
};
