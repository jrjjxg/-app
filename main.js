import App from './App'
import { setupPermissionGuard } from './utils/permission'
// 导入 echarts
import * as echarts from 'echarts'
// 导入图表组件
import qiunDataCharts from './uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue'

// 设置路由拦截
setupPermissionGuard()

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
// 全局注册 echarts
Vue.prototype.$echarts = echarts
// 全局注册图表组件
Vue.component('qiun-data-charts', qiunDataCharts)
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // 全局注册 echarts
  app.config.globalProperties.$echarts = echarts
  // 全局注册图表组件
  app.component('qiun-data-charts', qiunDataCharts)
  return {
    app
  }
}
// #endif