/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const packageJson = require('../package.json');

module.exports = {
	mode: 'production',
	context: path.resolve(__dirname, '..', 'src'),
	devtool: 'source-map',
	externals: [
		nodeExternals({modulesDir: 'node_modules'}),
		nodeExternals({modulesDir: path.join('..', '..', 'node_modules')}),
	],
	output: {
		path: path.resolve(__dirname, '..'),
		library: packageJson.name,
		libraryTarget: 'commonjs2',
	},
	resolve: {
		extensions: ['.js', '.mjs', '.ts', '.d.ts'],
	},
	optimization: {
		minimize: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							babelrc: false,
							presets: [['@imperium/babel-preset-imperium', {client: false}]],
						},
					},
				],
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							babelrc: false,
							presets: [
								[
									'@imperium/babel-preset-imperium',
									{client: false, typescript: true},
								],
							],
						},
					},
				],
			},
		],
	},
};