const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// 是否为生产环境
const isProduction = process.env.NODE_ENV !== 'development';

// 本地环境是否需要使用cdn
const devNeedCdn = false

// cdn链接
const cdn = {
    // cdn：模块名称和模块作用域命名（对应window里面挂载的变量名称）
    externals: {
        'vue': 'Vue',
        'vue-router': 'VueRouter',
        'axios': 'axios',
        'lodash': '_',
    },
    // cdn的css链接
    css: [

    ],
    // cdn的js链接
    js: [
        'https://cdn.bootcss.com/vue/2.6.11/vue.min.js',
        'https://cdn.bootcss.com/vue-router/3.2.0/vue-router.min.js',
        'https://cdn.bootcss.com/axios/1.3.4/axios.min.js',
        'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js'
    ]
}

module.exports = {
  assetsDir: 'static',     //  outputDir的静态资源(js、css、img、fonts)目录
  publicPath: './',   // 静态资源路径（默认/，如果不改打包后会白屏）
  productionSourceMap: false, //不输出map文件
  chainWebpack: config => {
    // 发布模式
    // ============注入cdn start============
    config.plugin('html').tap(args => {
        // 生产环境或本地需要cdn时，才注入cdn
        if (isProduction || devNeedCdn) args[0].cdn = cdn
        return args
    })
    // ============注入cdn start============

    // 在chainWebpack中新增以下代码
    config.plugins.delete('prefetch')
    config.module.rule('images')
        .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({ bypassOnDebug: true })

},

configureWebpack: config => {
    if (isProduction || devNeedCdn) config.externals = cdn.externals
    // 代码压缩
    config.plugins.push(
        new UglifyJsPlugin({
            uglifyOptions: {
                //生产环境自动删除console
                compress: {
                    drop_debugger: true,
                    drop_console: true,
                    pure_funcs: ['console.log']
                }
            },
            sourceMap: false,
            parallel: true
        })
    )

    // 公共代码抽离
    config.optimization = {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'all',
                    test: /node_modules/,
                    name: 'vendor',
                    minChunks: 1,
                    maxInitialRequests: 5,
                    minSize: 0,
                    priority: 100
                },
                common: {
                    chunks: 'all',
                    test: /[\\/]src[\\/]js[\\/]/,
                    name: 'common',
                    minChunks: 2,
                    maxInitialRequests: 5,
                    minSize: 0,
                    priority: 60
                },
                styles: {
                    name: 'styles',
                    test: /\.(sa|sc|c)ss$/,
                    chunks: 'all',
                    enforce: true
                },
                runtimeChunk: {
                    name: 'manifest'
                }
            }
        }
    }
},
  devServer: {
    // 端口号配置
    port: 4000,
    // 自动打开浏览器
    open: true,
    // 打包后webpack在本地配置的代理服务器失效
    proxy:{
      '/api': {
        // target: 'http://175.27.228.178:3000',
        target: 'http://139.9.135.28:8082',
        changeOrigin: true,
        secure: false, 
        pathRewrite: {'^/api': ''}
      }
    }
  }
}