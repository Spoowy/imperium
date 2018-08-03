require('@babel/register')({
	presets: [['@imperium/babel-preset-imperium',	{client: false}]],
	only: [
		function(filepath) {
			// console.log(filepath);
			return /src\/.*/.test(filepath);
		},
	],
});
const path = require('path');
const webpack = require('webpack');
const SCWorker = require('socketcluster/scworker');
const d = require('debug')('imperium.core.WorkerDev');
const worker = require('./worker').default;
const config = require('../../webpack/webpack.config.dev');

// Catch unhandled rejections
process.on('unhandledRejection', (reason, p) => {
	d('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

function hmr(app) {
	d('Webpack and HMR loading');

	// Webpack dev middleware - Compiles client code on the fly and in memory
	const compiler = webpack(config);
	app.use(require('webpack-dev-middleware')(compiler, { // eslint-disable-line global-require
		publicPath: config.output.publicPath,
	}));

	// Add Webpack HMR
	app.use(require('webpack-hot-middleware')(compiler)); // eslint-disable-line global-require
}

class Worker extends SCWorker {
	run() {
		const connPath = path.join(process.cwd(), 'src', 'Connectors.js');
		const Connectors = require(connPath).default;
		worker(this, {
			hmr,
			Connectors,
		});
	}
}

new Worker(); // eslint-disable-line no-new
