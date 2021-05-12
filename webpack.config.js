const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const env = process.env.NODE_ENV || 'development'
const production = env === 'production'

module.exports = {
  mode: env,
  devtool: production ? 'cheap-source-map' : 'source-map',
  entry: path.resolve(__dirname, 'example.js'),
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: production,
    splitChunks: {
      chunks: 'all',
      minSize: 0
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ],
            plugins: [
              [
                '@babel/plugin-transform-react-jsx',
                {
                  pragma: 'h'
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
}
