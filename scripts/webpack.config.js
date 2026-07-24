const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const webpack = require('webpack')
const { GenerateSW } = require('workbox-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'
const root = path.join(__dirname, '..')

function hashFile (relativePath) {
  const contents = fs.readFileSync(path.join(root, relativePath))
  return crypto.createHash('md5').update(contents).digest('hex')
}

function precacheEntries (dir, pattern) {
  return fs.readdirSync(path.join(root, dir))
    .filter((file) => pattern.test(file))
    .map((file) => ({
      url: `${dir}/${file}`,
      revision: hashFile(`${dir}/${file}`)
    }))
}

const config = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/main',
  output: {
    path: root,
    filename: 'litewrite.min.js'
  },
  plugins: [
    // remotestoragejs conditionally requires these modules that only exist in node/other environments
    new webpack.IgnorePlugin({ resourceRegExp: /^(xmlhttprequest|\.\/lang)$/ }),
    // remotestorage-module-documents still imports the removed `uuid/v4` deep import
    new webpack.NormalModuleReplacementPlugin(
      /^uuid\/v4$/,
      path.join(root, 'lib/uuid-v4-shim.js')
    )
  ],
  module: {
    rules: [
      {
        test: [/\.txt$/, /\.html$/],
        type: 'asset/source'
      }
    ]
  },
  resolve: {
    // Our source is plain CommonJS (no ESM interop helpers), so prefer each
    // dependency's CJS/UMD build over its ESM one to avoid getting back a
    // `{ default: ... }` namespace object where a function is expected.
    mainFields: ['browser', 'main', 'module'],
    alias: {
      'rs-adapter': path.join(root, 'lib/backbone.remoteStorage-documents'),
      snap: path.join(root, 'lib/snap')
    }
  }
}

if (isProduction) {
  config.plugins.push(
    new webpack.DefinePlugin({
      'window.PRODUCTION': 'true'
    }),
    new GenerateSW({
      cacheId: 'litewrite',
      swDest: 'service-worker.js',
      clientsClaim: true,
      skipWaiting: false,
      additionalManifestEntries: [
        { url: 'style/litewrite.css', revision: hashFile('style/litewrite.css') },
        ...precacheEntries('style', /\.(ttf|otf)$/),
        ...precacheEntries('img', /\.(png|svg)$/)
      ]
    })
  )
} else {
  config.devtool = 'eval-cheap-module-source-map'
  config.devServer = {
    static: {
      directory: root,
      // Only JS needs hot-reloading; watching the whole repo root also
      // picks up unrelated writes (e.g. test-results/) and forces spurious
      // full-page reloads.
      watch: false
    },
    port: 8000,
    hot: true,
    client: {
      overlay: true
    }
  }
}

module.exports = config
