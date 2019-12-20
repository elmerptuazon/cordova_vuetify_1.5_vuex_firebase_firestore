// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import * as FastClick from 'fastclick'
import Vue from 'vue';
import Vuetify from 'vuetify';

import 'typeface-roboto';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

import 'vuetify/dist/vuetify.css';

import VueCordova from 'vue-cordova';
import VueHead from 'vue-head';
import { VueExtendLayout, layout } from 'vue-extend-layout';
import VueEvents from 'vue-events';
// import Vueg from 'vueg';
// import 'vueg/css/transition-min.css';
import 'font-awesome/css/font-awesome.css';
import VueLazyload from 'vue-lazyload';
import vueTopprogress from 'vue-top-progress';
import Vue2Filters from 'vue2-filters';
import { NoticeBar } from 'vant';
import 'vant/lib/vant-css/notice-bar.css';
import { PullRefresh } from 'vant';
import 'vant/lib/vant-css/pull-refresh.css';
import 'vant/lib/vant-css/index.css';
import '../static/css/content-placeholder.css';
import VueMasonry from 'vue-masonry-css';
// import 'vue-smooth-picker/dist/css/style.css';
// import SmoothPicker from 'vue-smooth-picker';
import VueCardFormat from 'vue-credit-card-validation';
import VueCarousel from 'vue-carousel';
import moment from 'moment';
moment.suppressDeprecationWarnings = true;
Vue.prototype.$moment = moment;

import router from './router';
import store from './store';
import { AUTH } from './config/firebaseInit';

// if ('addEventListener' in document) {
// 	document.addEventListener('DOMContentLoaded', function() {
// 		FastClick.attach(document.body)
// 	}, false)
// }
Vue.use(Vuetify, {
	theme: {
		primary: process.env.primaryColor,
		secondary: '#424242',
		accent: '#82B1FF',
		error: '#FF5252',
		info: '#2196F3',
		success: '#4CAF50',
		warning: '#FFC107'
	}
});
Vue.config.productionTip = false
Vue.use(VueCordova)
Vue.use(VueHead)
Vue.use(VueExtendLayout)
Vue.use(VueEvents)
Vue.use(VueCardFormat);
// const vuegOptions={
// 	firstEntryDisable: false,
// 	forwardAnim: 'fadeIn',
// 	backAnim: 'fadeIn',
// 	shadow: false,
// }
// Vue.use(Vueg, router, vuegOptions)
Vue.use(VueLazyload, {
	silent: false,
	observer: false
})
Vue.use(vueTopprogress)
Vue.use(Vue2Filters)
Vue.use(NoticeBar)
Vue.use(PullRefresh)
Vue.use(VueMasonry);
// Vue.use(SmoothPicker);
Vue.use(VueCarousel);

// add cordova.js only if serving the app through file://
if (window.location.protocol === 'file:' || window.location.port === '3000') {
	var cordovaScript = document.createElement('script')
	cordovaScript.setAttribute('type', 'text/javascript')
	cordovaScript.setAttribute('src', 'cordova.js')
	document.body.appendChild(cordovaScript)
}

window.addEventListener("orientationchange", function () {
	screen.lockOrientation('portrait');
});

document.addEventListener('deviceready', () => {
	navigator.splashscreen.show();
}, false);

let app;
AUTH.onAuthStateChanged(async (user) => {

	try {
		if (!app) {

			document.addEventListener('deviceready', () => {
				navigator.splashscreen.hide();
			}, false)

			if (user) {

				// SET LOCAL STORAGE FOR OFFLINE CONTACTS
				if (!localStorage.getItem(`${user.uid}_offline_contacts`)) {
					localStorage.setItem(`${user.uid}_offline_contacts`, '[]')
				}

				await store.dispatch('accounts/RELOAD_USER_DATA', user.uid);

				app = new Vue({
					el: '#app',
					router,
					store,
					...layout,
					head: {
						meta: [
							{
								name: 'viewport',
								content: 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'
							}
						]
					}
				});

				await store.dispatch('stock_orders/GET');

			} else {

				app = new Vue({
					el: '#app',
					router,
					store,
					...layout,
					head: {
						meta: [
							{
								name: 'viewport',
								content: 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'
							}
						]
					}
				})
			}
		}
	} catch (err) {
		throw err;
	}
})
