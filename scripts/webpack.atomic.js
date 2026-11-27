const fs = require('node:fs')
const path = require('node:path')
const webpack = require('webpack')

const root = path.join(__dirname, '..')
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
const markup = html.split('<body>')[1].split('<script')[0].replace(/<footer>[\s\S]*?<\/footer>/, '')
const css = fs.readFileSync(path.join(root, 'style/litewrite.css'), 'utf8')
  .replaceAll('body > .scrollbox', '#root > .scrollbox')
  .replace(/url\(([^)]+)\)/g, (_, filename) => {
    const types = { '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png' }
    const type = types[path.extname(filename)]
    if (!type) throw new Error('Unsupported Litewrite stylesheet asset: ' + filename)
    const bytes = fs.readFileSync(path.resolve(root, 'style', filename))
    return 'url(data:' + type + ';base64,' + bytes.toString('base64') + ')'
  })

module.exports = {
  context: root,
  mode: 'production',
  entry: './src/atomic-drive.mjs',
  devtool: false,
  output: {
    path: path.join(root, 'atomic'),
    filename: 'litewrite-0.1.1.js',
    module: true,
    library: { type: 'module' },
    chunkLoading: false
  },
  experiments: { outputModule: true },
  // Retain dependency notices and avoid extraction into a separate file.
  optimization: { minimize: false },
  resolve: {
    mainFields: ['browser', 'main', 'module'],
    alias: {
      'rs-adapter': path.join(root, 'lib/backbone.remoteStorage-documents'),
      snap: path.join(root, 'lib/snap')
    }
  },
  module: {
    rules: [{ test: /\.(txt|html)$/, type: 'asset/source' }]
  },
  plugins: [
    new webpack.DefinePlugin({
      LITEWRITE_MARKUP: JSON.stringify(markup),
      LITEWRITE_CSS: JSON.stringify(css)
    })
  ],
  performance: { hints: false }
}
