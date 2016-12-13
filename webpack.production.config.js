var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./index.jsx",
  output: {
    path:  path.resolve(__dirname, "public"),
    publicPath: "assets",
    filename: "bundle.js"
  },
  resolve: {
      root: path.resolve(__dirname),
      extensions: ['', '.js', '.jsx', '.json']
  },
  devtoll: 'cheap-module-source-map',
  module: {
   loaders: [
     {
       test: /\.jsx$/,
       exclude: /node_modules/,
       loader: 'babel-loader',
       query: {
         presets: ['react', 'es2015']
       }
     },
     {
       test: /\.css$/,
       loader: 'style-loader!css-loader'
    }
   ]
 },
 resolve: {
   extensions: ['', '.js', '.jsx']
 },
 noParse: /lie\.js$/,
 plugins: [
   new webpack.DefinePlugin({
     'process.env': {
       'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: false,
      beautify: false,
      comments: false
    })
  ]
}
