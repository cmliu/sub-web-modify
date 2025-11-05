import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element-ui'
import './plugins/clipboard'
import './plugins/base64'
import './plugins/axios'
import './plugins/device'
import './plugins/particles'


import './assets/css/theme-tokens.css'
import './assets/css/glass-background.css'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/element-ui.scss'
import './assets/css/layout-utilities.css'
import './assets/css/light.min.css'
import './assets/css/dark.min.css'
import '@/icons' // icon

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
