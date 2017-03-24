/* eslint-env node */

const webpack = require('webpack'),
      path = require('path'),
      DashboardPlugin = require('webpack-dashboard/plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      autoprefixer = require('autoprefixer')

const nodeEnv = process.env.NODE_ENV || 'development',
      isProduction = nodeEnv === 'production',
      buildPath = path.join(__dirname, './build'),
      sourcePath = path.join(__dirname, './source'),
      modulesPath = path.join(__dirname, './node_modules'),
      phaserModule = path.join(modulesPath, './phaser-ce/'),
      phaser = path.join(phaserModule, 'build/custom/phaser-split.js'),
      pixi = path.join(phaserModule, 'build/custom/pixi.js'),
      p2 = path.join(phaserModule, 'build/custom/p2.js')

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.bundle.js'}),
  new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify(nodeEnv)}}),
  new webpack.NamedModulesPlugin(),
  new HtmlWebpackPlugin({
    path: buildPath,
    filename: 'index.html'
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      postcss: [autoprefixer({browsers: ['last 3 version', 'ie >= 10']})]
    }
  })
]

const rules = [
  {test: /pixi\.js/, use: ['script-loader']},
  {test: /phaser-split\.js$/, use: ['script-loader']},
  { test: /p2\.js/, use: ['script-loader'] },
  {
    test: /\.js$/,
    exclude: modulesPath,
    use: ['babel-loader']
  },
  {
    test: /\.(png|gif|jpg|svg)$/,
    include: sourcePath,
    use: 'url-loader?limit=20480&name=assets/[name]-[hash].[ext]'
  }
]

if(isProduction) {
  plugins.push(
    new webpack.LoaderOptionsPlugin({minimize: true, debug: false}),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        'screw_ie8': true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        'dead_code': true,
        evaluate: true,
        'if_return': true,
        'join_vars': true
      },
      output: {comments: false}
    }),
    new ExtractTextPlugin('style-[hash].css')
  )
  rules.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: 'css-loader!postcss-loader'
    })
  })
}
else {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin()
  )
  rules.push(
    {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: ['style-loader', 'css-loader', 'postcss-loader']
    }
  )
}

module.exports = {
  devtool: isProduction ? 'eval' : 'source-map',
  entry: {
    index: './source/index.js',
    vendor: ['pixi', 'p2', 'phaser']
  },
  output: {
    path: buildPath,
    publicPath: '/',
    filename: '[name].js'
  },
  module: {rules},
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      sourcePath
    ],
    alias: {
      'phaser': phaser,
      'pixi': pixi,
      'p2': p2
    }
  },
  plugins,
  devServer: {
    contentBase: isProduction ? './build' : './source',
    historyApiFallback: true,
    port: 3030,
    compress: isProduction,
    inline: !isProduction,
    hot: !isProduction,
    host: '0.0.0.0',
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true
    }
  }
}
