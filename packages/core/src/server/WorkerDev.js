/* eslint-disable import/no-dynamic-require */
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
const d = require('debug')('imperium.core.server.WorkerDev');
const worker = require('./worker').default;
const webpackConfig = require('../../webpack/client.dev');
const config = require('../../config');

// In development mode, we dynamically import our project definition code
const Connectors = require(path.join(process.cwd(), config.project.Connectors)).default;
const serverModules = require(path.join(process.cwd(), config.project.serverModules)).default;

// Catch unhandled rejections
process.on('unhandledRejection', (reason, p) => {
	d('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

/**
 * Adds webpack-dev-middleware and HMR to the express app
 * @param app
 * @returns {*}
 */
function hmr(app) {
	d('Webpack and HMR loading');

	// Webpack dev middleware - Compiles client code on the fly and in memory
	const compiler = webpack(webpackConfig);
	const hmrInstance = require('webpack-dev-middleware')(compiler, { // eslint-disable-line global-require
		publicPath: webpackConfig.output.publicPath,
		// writeToDisk: true,
	});
	app.use(hmrInstance);

	// Add Webpack HMR
	app.use(require('webpack-hot-middleware')(compiler)); // eslint-disable-line global-require

	return hmrInstance;
}

class Worker extends SCWorker {
	run() {
		worker(this, {
			hmr,
			Connectors,
			serverModules,
		});
	}
}

new Worker(); // eslint-disable-line no-new