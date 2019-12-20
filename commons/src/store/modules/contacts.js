import { DB, AUTH, STORAGE, COLLECTION } from '@/config/firebaseInit';
import moment from 'moment';
import loader from '@/assets/img/spinner.gif';
import malePlaceholder from '@/assets/img/male-default.jpg';
import femalePlaceholder from '@/assets/img/female-default.jpg';
const profPicStorageRef = STORAGE.ref('appsell').child('profile-pictures');

function realImgDimension(src) {
	return new Promise((resolve) => {
		var i = new Image();
		i.onload = function () {
			resolve({
				width: this.width,
				height: this.height
			});
		}
		i.src = src;
	})
}

const contacts = {
	namespaced: true,
	state: {
		onlineList: []
	},
	getters: {
		GET_ONLINE_LIST_WITH_ALPHABETS: (state, getters, rootState) => {
			let sortedUsers = []
			if (rootState.accounts.settings.contactsSortBy === 'first') {
				sortedUsers = state.onlineList.sort((a, b) => a.firstName.localeCompare(b.firstName))
			}
			else if (rootState.accounts.settings.contactsSortBy === 'last') {
				sortedUsers = state.onlineList.sort((a, b) => a.lastName.localeCompare(b.lastName))
			}
			var currentHeader
			let sortedUsersWithLetters = sortedUsers.reduce((a, user) => {
				if (rootState.accounts.settings.contactsSortBy === 'first') {
					if (currentHeader !== user.firstName[0]) {
						currentHeader = user.firstName[0]
						a.push({ header: currentHeader })
					}
				}
				else if (rootState.accounts.settings.contactsSortBy === 'last') {
					if (currentHeader !== user.lastName[0]) {
						currentHeader = user.lastName[0]
						a.push({ header: currentHeader })
					}
				}
				a.push(user)
				return a
			}, []);


			const finalUsers = [];
			sortedUsersWithLetters.forEach((user) => {
				let i;

				if (user.id) {
					i = finalUsers.findIndex(u => u.id === user.id);
				} else {
					i = finalUsers.findIndex(u => u.header === user.header);
				}

				if (i === -1) {
					finalUsers.push(user);
				}
			});

			return finalUsers;
		}
	},
	mutations: {
		ADD_TO_LIST(state, user) {
			state.onlineList.push(user)
		},
		SET_ONLINE_LIST(state, list) {
			state.onlineList = list;
		},
		CLEAR_LIST(state) {
			state.onlineList.length = 0
			state.onlineList = []
		},
		SET_USER(state, payload) {
			state.user = Object.assign({}, payload)
		}
	},
	actions: {
		async GET_ONLINE_CONTACTS({ commit, rootState, state }, payload) {
			const user = await COLLECTION.accounts.doc(rootState.accounts.userID).get();
			return new Promise((resolve) => {
				const customers = user.data().customers || [];
				const uids = customers.map(c => Object.keys(c)[0]);
				const promises = [];
				uids.forEach((uid) => {
					let userData;
					promises.push(
						COLLECTION.accounts.doc(uid).get()
							.then((doc) => {
								if (doc.exists) {
									userData = doc.data();
									userData.id = doc.id
									// set as online contact
									userData.contactType = 'Online'
									// add placeholder profile picture	
									const src = userData.gender === 'Male' ? malePlaceholder : femalePlaceholder
									userData.imageObj = {
										src,
										loading: loader
									}
									// add profile picture if hasPicture prop is true
									if (userData.hasPicture || userData.downloadURL) {
										userData.imageObj.src = userData.downloadURL
									}

									return realImgDimension(userData.imageObj.src);
								}
							})
							.then((dimensions) => {
								userData.imageDimensions = dimensions;
								return userData;
							})
					);
				});

				Promise.all(promises)
					.then((data) => {
						console.log(data)
						commit('SET_ONLINE_LIST', data);
						resolve({ success: true, contacts: data });
					});
			})
		},
		GET_CUSTOMERS({ }, payload) {
			return new Promise((resolve, reject) => {

				const user = AUTH.currentUser;
				COLLECTION.accounts.where('resellerId', '==', user.uid).get()
					.then((querySnapshot) => {

						let items = querySnapshot.docs.map((documentSnapshot) => {
							const data = documentSnapshot.data();
							data.uid = documentSnapshot.id;
							return data;
						});

						const contactsWithImagesSizes = [];

						items.forEach((item) => {
							const src = item.gender === 'Male' ? malePlaceholder : femalePlaceholder;
							item.imageObj = {
								src,
								loading: loader
							}
							// add profile picture if hasPicture prop is true
							if (item.hasPicture) {
								item.imageObj.src = item.downloadURL;
							}
							contactsWithImagesSizes.push(
								realImgDimension(item.imageObj.src)
									.then((dimensions) => {
										item.imageDimensions = dimensions;
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
												.where('uid', '==', item.uid)
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
												.where('uid', '==', item.uid)
												.get();
										}
										return query;
									})
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

										item.totalSpent = orders.reduce((a, order) => {
											let total = order.total

											if (order.discount) {
												if (order.discount.type == 'peso') {
													total -= order.discount.value;
												}
												else if (order.discount.type == 'percentage') {
													const discount = (order.discount.value / 100) * total;
													total -= discount;
												}
											}

											// if (order.delivery_charge) {
											// 	total += order.delivery_charge;
											// }
											return a + total;
										}, 0);


										item.totalItems = flattened_items.reduce((a, b) => +a + b.attribute.qty, 0);

										return item;
									})
							);
						});

						Promise.all(contactsWithImagesSizes)
							.then(data => resolve(data));

					});
			});
		},
		GET_OFFLINE_CUSTOMERS({ dispatch }, payload) {
			return new Promise((resolve, reject) => {
				let contacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));
				contacts = contacts.map((c) => {
					const src = c.gender === 'Male' ? malePlaceholder : femalePlaceholder;
					c.imageObj = {
						src,
						loading: loader
					}
					if (c.hasPicture) {
						c.imageObj.src = c.displayPicture;
					}
					return c;
				});

				const promises = [];
				const user = AUTH.currentUser;

				contacts.forEach((contact) => {
					promises.push(
						realImgDimension(contact.imageObj.src)
							.then((dimensions) => {
								contact.imageDimensions = dimensions;
								let query;
								if (payload.selected === 'Week') {
									// const timestampBefore = moment().subtract(60, 'days').format('x');
									// const timestampNow = moment().format('x');
									// query = await COLLECTION.accounts
									// .where('createdAt', '>=', +timestampBefore)
									// .where('createdAt', '<=', +timestampNow)
									// .where('offlineContact.id', '==', contact.id)
									// .get();
								} else if (payload.selected === 'Month') {
									const startTimestamp = moment().startOf('month').format('x');
									const endTimestamp = moment().endOf('month').format('x');
									query = COLLECTION.orders
										.where('created_at', '>=', +startTimestamp)
										.where('created_at', '<=', +endTimestamp)
										.where('offlineContact.id', '==', contact.id)
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
										.where('offlineContact.id', '==', contact.id)
										.where('resellerId', '==', user.uid)
										.get();
								}
								return query;
							})
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

								contact.totalSpent = orders.reduce((a, order) => {
									let total = order.total

									if (order.discount) {
										if (order.discount.type == 'peso') {
											total -= order.discount.value;
										}
										else if (order.discount.type == 'percentage') {
											const discount = (order.discount.value / 100) * total;
											total -= discount;
										}
									}

									// if (order.delivery_charge) {
									// 	total += order.delivery_charge;
									// }
									return a + total;
								}, 0);

								contact.totalItems = flattened_items.reduce((a, b) => +a + b.attribute.qty, 0);

								return contact;
							})
					);
				});

				Promise.all(promises)
					.then(data => resolve(data));
			});
		},
		SYNC_OFFLINE_CUSTOMERS() {
			return new Promise((resolve, reject) => {
				let contacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));

				const user = AUTH.currentUser;

				COLLECTION
					.offline_contacts
					.doc(user.uid)
					.set({
						data: contacts
					})
					.then(() => resolve())
					.catch((e) => {
						console.log(e);
						reject(e);
					});
			});
		},
		async UPDATE_OFFLINE_CONTACTS_IN_CLOUD({ }, contacts) {
			try {

				const user = AUTH.currentUser;

				await COLLECTION.offline_contacts.doc(user.uid).set({ data: contacts });

				return {
					success: true
				}

			} catch (error) {
				throw error;
			}
		}
	}
}

export default contacts

