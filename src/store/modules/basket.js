import Vue from 'vue'
import Storage from 'vue-ls'
import { AUTH } from '@/config/firebaseInit'
const storageOptions = {
  namespace: 'appsell__', // key prefix
  name: 'ls'
}
Vue.use(Storage, storageOptions)

function makeid() {
  let text = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

const basket = {
  namespaced: true,
  state: {
    items: []
  },
  getters: {
    GET_ITEMS: (state) => state.items,
    GET_SUBTOTAL: (state) => state.items.reduce((a, b) => a + (b.attribute.qty * b.product.price), 0),
    GET_ITEMS_LENGTH: (state) => state.items.length,
    GET_TOTAL_DISCOUNT: (state) => {}
  },
  mutations: {
    SET_ITEMS (state, items) {
      state.items = items
    },
    SET_ITEM (state, item) {
      const i = state.items.findIndex((itemData, itemIndex) => itemData._id === item._id)
      state.items[i] = item
    },
    ADD_ITEM (state, item) {
      state.items.push(item)
    },
    GET_ITEM (state, index) {
      const items = JSON.parse(Vue.ls.get('basketItems', '[]'))
      return items.findIndex((item, i) => i === index)
    },
    UPDATE_ITEM (state, item) {},
    REMOVE_ITEM (state, _id) {
      const i = state.items.findIndex((item, index) => item._id === _id)
      if (i >= 0) {
        state.items.splice(i, 1)
      }
    }
  },
  actions: {
    GET_ITEMS ({commit}, payload) {
      const id = `basketItems_${AUTH.currentUser.uid}`
      const items = JSON.parse(Vue.ls.get(id, '[]'))
      commit('SET_ITEMS', items)
    },
    ADD_ITEM ({commit}, item) {
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const id = `basketItems_${AUTH.currentUser.uid}`
          const items = JSON.parse(Vue.ls.get(id, '[]'))
          item._id = makeid()
          item.created_at = Date.now()
          items.push(item)
          Vue.ls.set(id, JSON.stringify(items))
          commit('ADD_ITEM', item)
          resolve()
        }, 10)
      })
    },
    UPDATE_ITEM ({commit, state}, item) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const i = state.items.findIndex((itemData, itemIndex) => itemData._id === item._id)
          if (i >= 0) {
            const id = `basketItems_${AUTH.currentUser.uid}`
            const items = JSON.parse(Vue.ls.get(id))
            items[i] = item
            Vue.ls.set(id, JSON.stringify(items))
            commit('SET_ITEM', item)
            resolve()
          }
        }, 100);
      })
    },
    REMOVE_ITEM ({commit, state}, _id) {
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const i = state.items.findIndex((item, itemIndex) => item._id === _id)
          if (i >= 0) {
            const id = `basketItems_${AUTH.currentUser.uid}`
            const items = JSON.parse(Vue.ls.get(id))
            items.splice(i, 1)
            Vue.ls.set(id, JSON.stringify(items))
            commit('REMOVE_ITEM', _id)
            resolve()
          }
        }, 10)
      })
    },
    EMPTY_BASKET ({commit}, payload) {
      const id = `basketItems_${AUTH.currentUser.uid}`
      Vue.ls.set(id, JSON.stringify([]))
      commit('SET_ITEMS', [])
    }
  }
}

export default basket

