/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html',
			favicon: 'public/img/favicon.svg',
		}),
	],
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	devServer: {
		static: './dist',
		hot: true,
		open: true,
		port: 8080,
		compress: true,
	},
	module: {
		rules: [
			{
				test: /\.(jpg|png|svg|gif)$/,
				type: 'asset/resource',
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(?:js|mjs|cjs)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', { targets: 'defaults' }],
						],
					},
				},
			},
		],
	},
};
