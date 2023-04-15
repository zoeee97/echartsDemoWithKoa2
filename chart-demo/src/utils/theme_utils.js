// 原生HTML主题样式适配
/* 定义两个主题下需要进行样式切换的样式数据，并对外导出一个函数，方便通过主题名获取对应主题的某些配置项 */
const theme = {
  chalk: {
    // 背景颜色
    backgroundColor: '#161522',
    // 标题的文字颜色
    titleColor: '#ffffff',
    // 切换主题按钮的图片路径
    themeSrc: 'qiehuan_dark.png',
    // 页面顶部的边框图片
    headerBorderSrc: 'header_border_dark.png',
    sellerAxisPointerColor: '#2D3443',
  },
  vintage: {
    // 背景颜色
    backgroundColor: '#eeeeee',
    // 标题的文字颜色
    titleColor: '#000000',
    // 切换主题按钮的图片路径
    themeSrc: 'qiehuan_light.png',
    // 页面顶部的边框图片
    headerBorderSrc: 'header_border_light.png',
    sellerAxisPointerColor: '#f1f2f6',
  }
}

export function getThemeValue (themeName) {
  return theme[themeName]
}
