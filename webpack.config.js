var path = require('path');

module.exports = {
  //entry: ["./app/assets/js/IndexView.jsx", "./app/assets/js/AdminPage.jsx", "./app/assets/js/RegisterView.jsx",
  // "./app/assets/js/Events.jsx", "./app/assets/js/Cabins.jsx"],
  entry: "./index.jsx",
  output: {
    path:  path.resolve(__dirname, "public"),
    publicPath: "assets",
    filename: "bundle.js"
  },
  devtool: 'source-map',
  watch: true,
  resolve: {
      root: path.resolve(__dirname),
      extensions: ['', '.js', '.jsx', '.json']
  },
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
 noParse: /lie\.js$/
}
