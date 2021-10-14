const CopyWebpackPlugin = require('copy-webpack-plugin')
const _path = require('path')

// ベースURLの設定
const publicPath = process.env.VUE_APP_BASE_PATH ?? ''

// 各エントリーポイントの設定
const pages = {
  index: {
    // entry for the page
    entry: 'src/index.ts',
    // the source template
    template: 'src/index.html',
    // output as "dist/index.html"
    filename: 'index.html',
    // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
    title: 'vue3-practical-boilerplate',
  },
}

// Vue CLI Configuration Reference
// https://cli.vuejs.org/config/
module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'combined',
      rtlSupport: false,
    },
  },
  transpileDependencies: ['quasar'],

  publicPath,

  pages,

  // Firebase Hostingでハッシュ付きのファイルを使用すると、
  // Service Workerで不具合が生じ、新しいリソースがキャッシュできなかったり、
  // 画面ロード時にリソースをうまく見つけられずエラーが発生したりする。
  // このためファイル名にハッシュをつけないよう設定している。
  filenameHashing: false,

  pwa: {
    name: 'vue3-practical-boilerplate',
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/manifest/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/manifest/safari-pinned-tab.svg',
      msTileImage: 'img/icons/manifest/msapplication-icon-144x144.png',
    },
    // Workbox webpack Plugins
    // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW#GenerateSW
    workboxOptions: {
      // skipWaitingについては以下を参照
      // https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle?hl=ja#updates
      skipWaiting: true,

      // ServiceWorkerインストール時にキャッシュされるファイルを設定
      include: [
        /\.html$/,
        /\.js$/,
        /\.css$/,
        /^favicon\.ico$/,
        /^robots\.txt$/,
        /^sitemap\.xml$/,
        /^img\/(?:[^/]+\/)*[^/]+\.(?:jpg|jpeg|png|gif|bmp|svg)$/,
        /^(?:fonts|css)\/(?:[^/]+\/)*[^/]+\.(?:woff|eot|woff2|ttf|svg)$/,
      ],
      exclude: [/\.map$/],

      // `/`以下のパスで存在しないファイルまたはディレクトリが
      // 指定された場合にindex.htmlへフォールバックするよう設定
      navigateFallback: `${_path.join(publicPath, '/index.html')}`,

      // フェッチ時にキャッシュされるパスを設定
      runtimeCaching: [
        {
          urlPattern: /\/api\//,
          handler: 'NetworkFirst',
        },
      ],
    },
  },

  chainWebpack: config => {
    // Vue I18n 単一ファイルコンポーネントの設定
    // http://kazupon.github.io/vue-i18n/guide/sfc.html
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
        .loader('@kazupon/vue-i18n-loader')
        .end()
      .use('yaml')
        .loader('yaml-loader')
        .end()

    // 必要なリソースファイルのコピー
    let copyFiles = [
      // 必要であれば追記
      // 例: { from: 'node_modules/firebase/firebase-*.js' },
    ]
    if (process.env.NODE_ENV !== 'production') {
      copyFiles = [
        ...copyFiles,
        // その他必要であれば追記
        // 例: { from: 'node_modules/aaa/bbb.css', to: 'node_modules/aaa' },
      ]
    }

    config
      .plugin('copy-prod')
      // 参照: https://github.com/vuejs/vue-cli/blob/c76d2e691d8ea58b219394ca7799f50d873b8588/packages/%40vue/cli-service/lib/commands/build/resolveAppConfig.js#L7
      .after('copy')
      .use(CopyWebpackPlugin, [copyFiles])
  },

  devServer: {
    port: process.env.VUE_APP_DEV_SERVER_PORT,
    host: '0.0.0.0',
    disableHostCheck: true,
    // writeToDisk: true,
  },
}
