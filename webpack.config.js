const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'source-map',

	entry: {
		background: './src/ts/background/background.ts',
		bmSelector: './src/ts/bookmark-selector/Controller.ts',
		menu: './src/ts/browserAction/Menu.ts',
		options: './src/ts/options/OptionsPage.ts',
		sidebar: './src/ts/sidebar/sidebar.ts',
		tabSelector: './src/ts/browserAction/TabSelector.ts',
		privileged: './src/ts/extension-pages/privileged.ts',

		'bookmark-selector': './src/scss/bookmark-selector.scss',
		'menu-css': './src/scss/menu.scss',
		'options-css': './src/scss/options.scss',
		'overlay-menu': './src/scss/overlay-menu.scss',
		'privileged-css': './src/scss/privileged.scss',
		'tab-selector': './src/scss/tab-selector.scss',
		'sidebar-css': './src/scss/sidebar.scss',
		'tab-view-simple-list': './src/scss/tab-view-simple-list.scss'
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].js'
	},

	resolve: {
		// Add '.ts' as a resolvable extension.
		extensions: ['.ts', '.js']
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							import: false,
							url: false
						}
					},
					'sass-loader'
				]
			}
		]
	},

	plugins: [
		new CopyWebpackPlugin([
			'manifest.json',
			'img/**/*',
			'html/**/*',
			'fonts/**/*',
			'_locales/**/*'
		], { context: './src/' }),

		new MiniCssExtractPlugin({
			filename: "css/[name].css"
		})
	]
}
