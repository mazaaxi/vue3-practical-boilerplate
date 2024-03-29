const CopyWebpackPlugin = require('copy-webpack-plugin')
const _path = require('path')

// setting a base URL
const publicPath = process.env.VUE_APP_BASE_PATH ?? ''

// setting an entry point
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

  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @use '@/styles/app' as *;
        `,
      },
    },
  },

  // Using files with hashes in Firebase Hosting causes problems with Service Worker,
  // which can't cache new resources, or can't find the resource properly when loading the screen, resulting in errors.
  // For this reason, the file name is set to not have a hash.
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
      // see below for more information about `skipWaiting`
      // https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle?hl=ja#updates
      skipWaiting: true,

      // set files to be cached when ServiceWorker is installed
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

      // set fallback to `index.html` when a non-existent file or directory is specified in a path under `/`.
      navigateFallback: `${_path.join(publicPath, '/index.html')}`,

      // set paths to be cached on fetch
      runtimeCaching: [
        {
          urlPattern: /\/api\//,
          handler: 'NetworkFirst',
        },
      ],
    },
  },

  chainWebpack: config => {
    // copy the necessary resource files
    let copyFiles = [
      // add more if necessary
      // ex. { from: 'node_modules/firebase/firebase-*.js' },
    ]
    if (process.env.VUE_APP_BUILD_MODE !== 'remote') {
      copyFiles = [
        ...copyFiles,
        // add more if necessary
        // ex. { from: 'node_modules/aaa/bbb.css', to: 'node_modules/aaa' },
      ]
    }

    config
      .plugin('copy-prod')
      // cf. https://github.com/vuejs/vue-cli/blob/c76d2e691d8ea58b219394ca7799f50d873b8588/packages/%40vue/cli-service/lib/commands/build/resolveAppConfig.js#L7
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
