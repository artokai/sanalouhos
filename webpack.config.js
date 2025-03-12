const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

  entry: "./src/main.ts",
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },  
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CopyWebpackPlugin({
        patterns: [
          { from: 'assets', to: '' },
          { from: 'src/styles.css', to: '' }
        ],
    }),
  ],  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
