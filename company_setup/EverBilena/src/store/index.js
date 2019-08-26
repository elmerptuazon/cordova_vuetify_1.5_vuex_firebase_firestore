import Vue from 'vue';
import Vuex from 'vuex';

import accounts from './modules/accounts';
import plugins from './modules/plugins';
import catalogues from './modules/catalogues';
import products from './modules/products';
import basket from './modules/basket';
import orders from './modules/orders';
import contacts from './modules/contacts';
import inventory from './modules/inventory';
import sales from './modules/sales';
import calendar from './modules/calendar';
import sqlite_storage from './modules/sqlite-storage';
import stock_orders from './modules/stock-orders';
import support from './modules/support';
import conversations from './modules/conversations';

import logo from '@/assets/img/header_logo.jpg';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        toolbarTitle: null,
        showToolbar: true,
        showTabs: true,
        extendedTabToolbar: false,
        currenCatalogue: null,
        showToolbarTitles: false,
        rightAlignToolbarIcons: false,
        //companyId: 'p0JywuLBg5zQUnXnQOxc',
        storageCode: process.env.storageCode,
        companyLogo: logo,
        webAdminId: process.env.webAdminId,
        companyName: process.env.companyName,
        version: process.env.version,
    },
    getters: {
        GET_TOOLBAR_TITLE: state => {
            let title = 'AppSell'
            if (state.toolbarTitle) {
                title = state.toolbarTitle.charAt(0).toUpperCase() + state.toolbarTitle.slice(1)
            }
            return title
        },
        GET_SHOW_TOOLBAR: state => state.showToolbar,
        GET_SHOW_TABS: state => state.showTabs,
        GET_CURRENT_CATALOGUE: state => state.currenCatalogue,
        GET_EXTENDED_TOOLBAR: state => state.extendedTabToolbar,
        GET_SHOW_TOOLBAR_TITLES: state => state.showToolbarTitles,
        GET_LOGO: state => state.companyLogo,
        GET_VERSION: state => state.version,
        GET_COMPANY: state => state.companyName
    },
    mutations: {
        SET_TOOLBAR_TITLE(state, payload) {
            state.toolbarTitle = payload
        },
        SET_SHOW_TOOLBAR(state, payload) {
            state.showToolbar = payload
        },
        SET_SHOW_TABS(state, payload) {
            state.showTabs = payload
        },
        SET_EXTENDED_TOOLBAR(state, payload) {
            state.extendedTabToolbar = !state.extendedTabToolbar
        },
        SET_CURRENT_CATALOGUE(state, payload) {
            state.currenCatalogue = payload
        }
    },
    modules: {
        accounts,
        plugins,
        catalogues,
        products,
        basket,
        orders,
        contacts,
        inventory,
        sales,
        calendar,
        sqlite_storage,
        stock_orders,
        support,
        conversations
    }
})
