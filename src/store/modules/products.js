import {DB, AUTH, STORAGE, COLLECTION} from '@/config/firebaseInit';
import loader from '@/assets/img/fb-loader-small.svg';
const productStorageRef = STORAGE.ref('appsell').child('products');
const moment = require('moment');

const products = {
	namespaced: true,
	state: {
		products: [],
		catalogue: {},
		productQuery: ''
	},
	getters: {
		GET_PRODUCTS: state => state.products,
		GET_PRODUCT_QUERY: state => state.productQuery,
	},
	mutations: {
		SET_PRODUCTS (state, payload) {
			state.products = payload
		},
		CLEAR_PRODUCTS (state) {
			state.products.length = []
		},
		SET_PRODUCT_QUERY (state, payload) {
			state.productQuery = payload;
		},
	},
	actions: {
		async GET_PRODUCTS ({commit}, payload) {
			try {
				commit('CLEAR_PRODUCTS')
				let querySnapshot = await COLLECTION.products
				.where('categoryId', '==', payload)
				.where('active', '==', 1)
				.get()
				let products = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data()
					data.id = documentSnapshot.id
					data.imageObj = {
						src: data.downloadURL,
						loading: loader
					}
					return data
				})
				commit('SET_PRODUCTS', products);
				return products;
			} catch (error) {
				throw error
			}
		},
		async GET_PRODUCT({}, product_id) {
			try {
				let data = {};
				const doc = await COLLECTION.products.doc(product_id).get();
				if (doc.exists) {
					data = doc.data();
					data.id = doc.id;
				}
				return data;
			} catch(error) {
				return error;
			}
		},
		GET_ALL_PRODUCTS ({}, payload) {
			return new Promise((resolve, reject) => {

				const user = AUTH.currentUser;
				let query;

				if (payload.selected === 'Week') {
					// const timestampBefore = moment().subtract(60, 'days').format('x');
					// const timestampNow = moment().format('x');
					// query = await COLLECTION.accounts
					// .where('createdAt', '>=', +timestampBefore)
					// .where('createdAt', '<=', +timestampNow)
					// .where('resellerId', '==', user.uid)
					// .get();
				} else if (payload.selected === 'Month') {
					const startTimestamp = moment().startOf('month').format('x');
					const endTimestamp = moment().endOf('month').format('x');
					query = COLLECTION.orders
					.where('created_at', '>=', +startTimestamp)
					.where('created_at', '<=', +endTimestamp)
					.where('resellerId', '==', user.uid)
					.get();
				} else if (payload.selected === 'Quarter') {
					const quarters = {
						1: {
							start: 1,
							end: 3
						},
						2: {
							start: 4,
							end: 6
						},
						3: {
							start: 7,
							end: 9
						},
						4: {
							start: 10,
							end: 12
						}
					};
					const currentQuarter = moment().quarter();
					const startTimestamp = moment(quarters[currentQuarter].start, 'M').startOf('month').format('x');
					const endTimestamp = moment(quarters[currentQuarter].end, 'M').endOf('month').format('x');
					query = COLLECTION.orders
					.where('created_at', '>=', +startTimestamp)
					.where('created_at', '<=', +endTimestamp)
					.where('resellerId', '==', user.uid)
					.get();
				}

				query
				.then((ordersSnapshot) => {
					// get customer orders
					const orders = ordersSnapshot.docs.map((documentSnapshot) => {
						const data = documentSnapshot.data();
						data.id = documentSnapshot.id;
						return data;
					});

					// get basket items
					const flattened_items = [].concat.apply([], orders.map((order) => {
						return order.basket.map(item => item);
					}));

					resolve(flattened_items);
				})
				.catch(error => reject(error));
			});
		},

		async SEARCH_PRODUCTS({ commit }, payload) {
			let allProduct = [];
			let response = {};

			commit('SET_PRODUCT_QUERY', payload);
			const productSnapshot = await COLLECTION.products.where('name', '>=', payload).get();
			if(!productSnapshot.empty) {
				allProduct = productSnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});
				
				response = {
					data: allProduct,
					success: true
				}
			}
			else {
				response = {
					data: null,
					success: false
				}
			}

			return response;
		}
	}
}

export default products

