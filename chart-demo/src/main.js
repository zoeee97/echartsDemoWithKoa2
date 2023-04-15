/*
 * @Author: zyy 1741540959@qq.com
 * @Date: 2023-02-24 21:06:01
 * @LastEditors: zyy
 * @LastEditTime: 2023-02-26 20:01:28
 * @Description: file content
 */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';

// 引入字体文件
import './assets/font/iconfont.css'
// 引入全局样式
import './assets/css/global.less';
import SocketService from '@/utils/socket_service';
Vue.prototype.$socket = SocketService.Instance;
// 对服务端进行websocket连接
SocketService.Instance.connect();

// axios.defaults.baseURL = '/api';
axios.defaults.baseURL = 'http://139.9.135.28:8082';

// 将全局的echarts对象挂载到Vue的原型对象上
Vue.prototype.$echarts = echarts;

Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
