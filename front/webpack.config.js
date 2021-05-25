const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

const config = {
  name: "ecproject",
  mode: isProduction ? "production" : "development",
  devtool: "hidden-source-map",
  entry: {
    index: "./src/index.js",
  },
  output: {
    filename: "[name].js?[contenthash]",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 500000,
      maxSize: 500000,
      automaticNameDelimiter: "-",
    },
    minimize: isProduction,
    minimizer: [],
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    // alias: {
    //   "@components": path.resolve(__dirname, "src/components"),
    //   "@constant": path.resolve(__dirname, "src/constant"),
    //   "@containers": path.resolve(__dirname, "src/containers"),
    //   "@hooks": path.resolve(__dirname, "src/hooks"),
    //   "@pages": path.resolve(__dirname, "src/pages"),
    //   "@store": path.resolve(__dirname, "src/store"),
    //   "@lib": path.resolve(__dirname, "src/lib"),
    // },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js|jsx|tsx)?$/,
        loader: "babel-loader",
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: { browsers: ["last 2 versions"] },
                debug: !isProduction,
              },
            ],
            "@babel/preset-react",
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-transform-runtime",
          ],
        },
        exclude: path.join(__dirname, "node_modules"),
      },
      {
        test: /\.css?$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
      {
        test: /\.(sass|scss)?$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 3,
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
      {
        test: /\.(bmp|gif|png|jpe?g|svg)$/,
        loader: "url-loader",
        options: {
          limit: 1000,
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, "public/index.html"),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
  devServer: {
    port: 3000,
    proxy: {
      "/graphql": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
};

module.exports = config;
