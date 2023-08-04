import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { fileURLToPath } from 'url'
import { Configuration as BaseConfiguration } from 'webpack'
import { ServerConfiguration } from 'webpack-dev-server'

type Configuration = BaseConfiguration & ServerConfiguration

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const prod = process.env.PROD || !process.env.WEBPACK_SERVE

const config: Configuration = {
  stats: 'minimal',
  mode: prod ? 'production' : 'development',
  entry: './src/index.tsx',
  devtool: prod ? 'source-map' : 'eval-cheap-module-source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['postcss-preset-env']],
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: prod ? 'index.[contenthash].html' : 'index.html',
      template: './src/index.html',
    }),
  ],
  devServer: {
    hot: false,
    watchFiles: ['./src/index.html'],
    historyApiFallback: {
      disableDotRule: true,
    },
    allowedHosts: ['.amazonaws.com'],
  },
}

export default config
