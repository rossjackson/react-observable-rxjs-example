import CopyPlugin from 'copy-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { Configuration } from 'webpack'
import 'webpack-dev-server'

const isProduction = process.env.NODE_ENV == 'production'

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader'

const config: Configuration = {
   entry: './src/index',
   output: {
      publicPath: 'auto',
   },
   devServer: {
      open: true,
      port: 3000,
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: './public/index.html',
      }),
      new ESLintPlugin({
         extensions: ['js', 'jsx', 'ts', 'tsx'],
      }),
      new CopyPlugin({
         patterns: [
            {
               context: 'public',
               from: '*.{ico,png,json,txt}',
            },
         ],
      }),
   ],
   module: {
      rules: [
         {
            test: /\.(ts|tsx)$/i,
            use: 'ts-loader',
            exclude: /node_modules/,
         },
         {
            test: /\.(js|jsx)$/i,
            loader: 'babel-loader',
         },
         {
            test: /\.scss$/i,
            use: [stylesHandler, 'css-loader', 'sass-loader'],
         },
         {
            test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
            type: 'asset',
         },

         // Add your rules for custom modules here
         // Learn more about loaders from https://webpack.js.org/loaders/
      ],
   },
   resolve: {
      plugins: [new TsconfigPathsPlugin()],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
   },
   target: 'web',
}

module.exports = () => {
   if (isProduction) {
      config.mode = 'production'

      config.plugins?.push(new MiniCssExtractPlugin())
   } else {
      config.mode = 'development'
      config.devtool = 'inline-source-map'
   }
   return config
}
