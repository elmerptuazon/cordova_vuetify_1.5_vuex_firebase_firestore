import { DB, AUTH, COLLECTION } from '@/config/firebaseInit';
import moment from 'moment';

function generateOrderNumber(resellerID) {
	var refNumber = (BigInt(resellerID).toString(36) + "-" + BigInt(Date.now()).toString(36)).toUpperCase();
	return refNumber;
}

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

const orders = {
	namespaced: true,
	state: {
		orders: [],
		order: {},
		customerOrders: [],
		customerSubscriber: null,
		subscriber: null,
		proposed_subscriber: null
	},
	getters: {
		GET_ORDERS: state => state.orders,
		GET_ORDER: state => state.order,
		GET_CUSTOMER_ORDERS: state => state.customerOrders,
	},
	mutations: {
		SET_ORDERS(state, orders) {
			state.orders = orders
		},
		SET_ORDER(state, order) {
			state.order = Object.assign({}, order)
		},
		SET_CUSTOMER_ORDER(state, payload) {
			state.customerOrders = payload;
		},
		UPDATE_ORDER(state, order) {
			const i = state.orders.findIndex(o => o.orderNo == order.orderNo)
			if (i >= 0) {
				const updatedOrder = Object.assign({}, state.orders[i], order.data)
				state.orders[i] = { ...updatedOrder }
				state.order = { ...updatedOrder }
			}
		}

	},
	actions: {
		async GET_ORDERS({ commit }, payload) {
			try {
				const user = AUTH.currentUser;
				let querySnapshot;

				querySnapshot = await COLLECTION.orders.where('uid', '==', user.uid).get();

				const orders = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.orderNo = documentSnapshot.id;
					return data;
				});

				commit('SET_ORDERS', orders);
				return orders;
			} catch (error) {
				throw error;
			}
		},
		async GET_ORDERS_RESELLER_VIEW({ commit }) {
			try {
				const user = AUTH.currentUser
				const querySnapshot = await COLLECTION.orders.where('resellerId', '==', user.uid).get()
				const orders = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data()
					data.orderNo = documentSnapshot.id
					return data
				});

				const promises = [];

				orders.forEach((order) => {
					//updating the offlineContact field will yield to alot of problems that might appear with the app
					//so instead, we just mask the data of the online user as "offlineContact" as an easier fix
					//and will also have less problems with other modules.
					if (order.hasOwnProperty('offlineContact')) {
						order.isOffline = true;
						promises.push(order);
					}
					else {
						promises.push(
							COLLECTION.accounts.doc(order.uid).get()
								.then(doc => {
									order.offlineContact = doc.data();
									order.offlineContact.imageObj = { loading: "./img/spinner.9ac168c.gif", src: doc.data().downloadURL };
									order.isOffline = false;
									return order;
								})
						);
					}

				});

				const ordersWithUsers = await Promise.all(promises);

				console.log(ordersWithUsers);
				return ordersWithUsers


			} catch (error) {
				throw error
			}
		},
		async GET_RESELLER_ORDERS({ commit }, includeSelfOrders = true) {
			try {
				const user = AUTH.currentUser
				const querySnapshot = await COLLECTION.orders.where('resellerId', '==', user.uid).get()
				const orders = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data()
					data.orderNo = documentSnapshot.id
					return data
				});

				// if (includeSelfOrders) {
				// 	const selfOrderQuerySnapshot = await COLLECTION.orders
				// 		.where('uid', '==', user.uid)
				// 		.where('selfOrder', '==', true)
				// 		.get()

				// 	const selfOrders = selfOrderQuerySnapshot.docs.map((documentSnapshot) => {
				// 		const data = documentSnapshot.data()
				// 		data.orderNo = documentSnapshot.id
				// 		return data
				// 	});

				// 	selfOrders.forEach((order) => orders.push(order));
				// }

				const promises = [];

				orders.forEach((order) => {

					promises.push(
						COLLECTION.accounts.doc(order.uid).get()
							.then(doc => {
								order.userData = doc.data();
								return order;
							})
					);

				});

				const ordersWithUsers = await Promise.all(promises);

				const items = [];

				ordersWithUsers.forEach((order) => {
					//console.log(order);
					if (order.offlineContact) {
						const checkIndex = items.findIndex(i => i.uid == order.offlineContact.id);
						if (checkIndex >= 0) {
							items[checkIndex].orders.push(order);
						} else {
							const obj = {
								uid: order.offlineContact.id,
								fullName: `${order.offlineContact.firstName} ${order.offlineContact.middleInitial || ''} ${order.offlineContact.lastName}`,
								orders: []
							}
							obj.orders.push(order);
							items.push(obj);
						}
						return;
					}

					// if not offline contact
					const checkIndex = items.findIndex(i => i.uid == order.uid);
					if (checkIndex >= 0) {
						items[checkIndex].orders.push(order);
					} else {
						const obj = {
							uid: order.uid,
							fullName: `${order.userData.firstName} ${order.userData.middleInitial || ''} ${order.userData.lastName}`,
							orders: []
						}
						obj.orders.push(order);
						items.push(obj);
					}

				});

				console.log(items)

				return items;

			} catch (error) {
				throw error
			}
		},
		async GET_RESELLER_ORDERS_BY_TIMESTAMP({ commit }, payload) {
			try {
				const user = AUTH.currentUser;
				let querySnapshot;
				if (payload.selected === 'Week') {
					const timestampBefore = moment().subtract(2, 'months').format('x');
					const timestampNow = moment().format('x');
					querySnapshot = await COLLECTION.orders
						.where('created_at', '>=', +timestampBefore)
						.where('created_at', '<=', +timestampNow)
						.where('resellerId', '==', user.uid)
						.get();
				} else if (payload.selected === 'Month') {
					const startTimestamp = moment().startOf('month').format('x');
					const endTimestamp = moment().endOf('month').format('x');
					querySnapshot = await COLLECTION.orders
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
					querySnapshot = await COLLECTION.orders
						.where('created_at', '>=', +startTimestamp)
						.where('created_at', '<=', +endTimestamp)
						.where('resellerId', '==', user.uid)
						.get();
				}

				// const querySnapshot = await COLLECTION.orders.where('resellerId', '==', user.uid).get()
				const items = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.orderNo = documentSnapshot.id;
					return data;
				});

				return items;

			} catch (error) {
				throw error
			}
		},
		GET_ORDERS_BY_STATUS({ commit, dispatch, rootState }, payload) {
			return new Promise((resolve) => {
				const user = AUTH.currentUser
				// const selfOrders = COLLECTION.orders.where('uid', '==', user.uid).where('status', '==', payload.status).get()
				const customerOrders = COLLECTION.orders
					.where('resellerId', '==', user.uid)
					.where('status', '==', payload.status)
					.get()

				customerOrders.then((querySnapshot) => {
					const orders = [];
					querySnapshot.forEach((doc) => {
						const data = doc.data();
						data.id = doc.id;
						orders.push(
							COLLECTION.accounts.doc(data.uid).get()
								.then((account) => {
									data.accountData = account.data();

									if (data.offlineContact) {
										const offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));
										const i = offlineContacts.findIndex((offline_user) => offline_user.id === data.offlineContact.id);
										if (i !== -1) {
											data.offlineContact = offlineContacts[i];
										}
									}

									if (data.accountData.downloadURL && !data.offlineContact) {
										if (window.location.protocol === 'file:' || window.location.port === '3000') {
											data.accountData.downloadURL = data.accountData.downloadURL.replace('/static/', '');
										}
										return realImgDimension(data.accountData.downloadURL);
									}

									if (data.offlineContact && data.offlineContact.displayPicture) {
										if (window.location.protocol === 'file:' || window.location.port === '3000') {
											data.offlineContact.displayPicture = data.offlineContact.displayPicture.replace('/static/', '');
										}
										return realImgDimension(data.offlineContact.displayPicture);
									}

									if (data.offlineContact && !data.offlineContact.displayPicture && data.offlineContact.imageObj && data.offlineContact.imageObj.src) {
										if (window.location.protocol === 'file:' || window.location.port === '3000') {
											data.offlineContact.imageObj.src = data.offlineContact.imageObj.src.replace('/static/', '');
										}
										return realImgDimension(data.offlineContact.imageObj.src);
									}
								})
								.then((dimensions) => {
									if (data.accountData && data.accountData.downloadURL && !data.offlineContact) {
										data.accountData.imageDimensions = dimensions;
									}

									if (data.offlineContact && data.offlineContact.displayPicture) {
										data.offlineContact.imageDimensions = dimensions;
									}

									if (data.offlineContact && !data.offlineContact.displayPicture && data.offlineContact.imageObj && data.offlineContact.imageObj.src) {
										data.offlineContact.imageDimensions = dimensions;
									}

									return data;
								})
						);
					})

					Promise.all(orders)
						.then((allOrders) => {
							COLLECTION.orders
								.where('uid', '==', user.uid)
								.where('status', '==', payload.status)
								.get()
								.then((querySnapshot) => {
									// Get also reseller orders

									const resellerOrders = querySnapshot.docs.map((documentSnapshot) => {
										const data = documentSnapshot.data();
										data.id = documentSnapshot.id;
										data.accountData = rootState.accounts.user;
										return data;
									});

									const otherOrders = [];

									let resellerOrdersCopy = resellerOrders.filter(order => !order.offlineContact);
									resellerOrdersCopy.forEach((data) => {

										if (!data.offlineContact) {
											otherOrders.push(data);
										}

									});

									Promise.all(otherOrders)
										.then((resellerOrdersCopyData) => {
											const finalOrders = [...allOrders, ...resellerOrdersCopyData];

											console.log(resellerOrdersCopyData)

											const offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));

											// re-check offline contact image
											finalOrders.forEach((order) => {

												console.log(order)

												if (order.offlineContact) {
													const i = offlineContacts.findIndex(c => c.id === order.offlineContact.id);

													if (i !== -1) {

														if (offlineContacts[i].displayPicture) {
															console.log(offlineContacts[i])
															order.offlineContact.displayPicture = offlineContacts[i].displayPicture;
															order.offlineContact.imageObj = {};
															order.offlineContact.imageObj.src = offlineContacts[i].displayPicture;
														}

													}
												}

											});

											resolve(finalOrders);
										});
								});
						});
				})
			});
		},
		async PLACE_ORDER({ commit, rootState }, payload) {
			try {
				let orderDetails = {}
				let orderNumberExists = true
				const user = AUTH.currentUser
				const basket = rootState.basket.items
				const resellerID = rootState.accounts.user.resellerId;
				const agentID = await COLLECTION.accounts.doc(resellerID).get();
				do {
					const orderNo = await generateOrderNumber(agentID.data().agentId);
					const doc = await COLLECTION.orders.doc(orderNo).get()
					if (doc.exists) {
						orderNumberExists = true;
					} else {
						orderNumberExists = false;
						const totalPrice = basket.reduce((a, b) => {
							const total = b.attribute.qty * b.product.price;
							return +a + +total;
						}, 0)
						orderDetails = {
							basket,
							uid: user.uid,
							total: totalPrice,
							created_at: Date.now(),
							status: 'placed'
						}
						if (rootState.accounts.user.type === 'Customer') {
							orderDetails.resellerId = rootState.accounts.user.resellerId;

						} else {
							orderDetails.selfOrder = true;
						}
						orderDetails.read = false;
						console.log('customer checkout: ', orderDetails);
						await COLLECTION.orders.doc(orderNo).set(orderDetails);
						orderDetails.orderNo = orderNo;
					}
				} while (orderNumberExists)
				return orderDetails
			} catch (e) {
				throw e
			}
		},
		async PLACE_OFFLINE_ORDER({ commit, rootState }, payload) {
			try {
				let orderDetails = {}
				let orderNumberExists = true
				const user = AUTH.currentUser
				const basket = payload.basket.items
				do {
					const orderNo = generateOrderNumber(rootState.accounts.user.agentId)
					const doc = await COLLECTION.orders.doc(orderNo).get()
					if (doc.exists) {
						orderNumberExists = true
					} else {
						orderNumberExists = false
						const totalPrice = basket.reduce((a, b) => {
							const total = b.attribute.qty * b.product.price
							return +a + +total
						}, 0)
						const offlineContact = Object.assign({}, payload)
						delete offlineContact.basket
						orderDetails = {
							basket,
							uid: user.uid,
							resellerId: user.uid,
							total: totalPrice,
							created_at: Date.now(),
							status: 'placed',
							offlineContact
						}
						await COLLECTION.orders.doc(orderNo).set(orderDetails)
						orderDetails.orderNo = orderNo
					}
				} while (orderNumberExists)
				return orderDetails
			} catch (e) {
				throw e
			}
		},
		async GET_ORDER({ commit }, orderNo) {
			try {
				const doc = await COLLECTION.orders.doc(orderNo).get()
				if (doc.exists) {
					const documentData = doc.data()
					documentData.orderNo = doc.id
					commit('SET_ORDER', documentData)
					return documentData
				} else {
					throw {
						message: 'No order found'
					}
				}
			} catch (e) {
				throw e
			}
		},
		async UPDATE_ORDER({ commit }, data) {
			try {
				return await COLLECTION.orders.doc(data.orderNo).update(data.object);
			} catch (e) {
				throw e;
			}
		},

		LISTEN_TO_CUSTOMER_ORDERS({ state, commit, rootGetters, dispatch}, notificationSetting) {
			const user = AUTH.currentUser;

			state.customerOrders = [];
			
			state.customerSubscriber = COLLECTION.orders.where('resellerId', '==', user.uid)
			.onSnapshot(async (snapshot) => {

				console.log('listening to customer orders');

				let changes = snapshot.docChanges();
				// changes = changes.filter(doc => doc.type === 'added');

				changes = changes.map((change) => {
					const order = change.doc.data();
					order.id = change.doc.id;
					order.type = change.type;
					return order;
				});

				for(let order of changes) {
					//updating the offlineContact field will yield to alot of problems that might appear with the app
					//so instead, we just mask the data of the online user as "offlineContact" as an easier fix
					//and will also have less problems with other modules.
					if (order.hasOwnProperty('offlineContact')) {
						order.isOffline = true; //customer is an offline customer
					}
					else {
						const customerData = await dispatch('accounts/GET_USER', order.uid, { root: true });

						order.offlineContact = customerData;
						order.offlineContact.imageObj = { loading: "./img/spinner.9ac168c.gif", src: customerData.downloadURL };
						order.isOffline = false; //customer is an online customer
					}
					
					if(order.type === 'added') {
						state.customerOrders.push(order);

						//notify the reseller that they have a new customer order
						//notify only if the user enabled the new orders notification setting 
						if(notificationSetting && !order.read) {
							const notif = {
								title: 'New customer order received!',
								text: `Order #${order.id} - Click to open app`,
								redirectURL: {
									name: 'PlacedOrder',
									params: {
										order: docData
									},
									query: {
										fromOrders: true
									}
								},
							};
							dispatch('accounts/SEND_PUSH_NOTIFICATION', notif, { root : true });
						}
						
					
					} else if(order.type === 'modified') {
						const index = state.customerOrders.findIndex((customerOrder) => customerOrder.id === order.id);
						if(index !== -1) {
							state.customerOrders[index] = order;
						}
					}

					delete order.type;
					
				}
				
			})

		},
		LISTEN_TO_PROPOSED_DELIVERIES({ commit, state, rootState }) {
			const user = rootState.accounts.user;

			console.log('Listening to delivery propositions');

			if (user.type === 'Customer') {
				state.proposed_subscriber = COLLECTION
					.orders
					.where('uid', '==', user.uid)
					.onSnapshot((snapshot) => {
						snapshot.docChanges().forEach((change) => {
							const docData = change.doc.data();
							const docId = change.doc.id;

							if (change.type === 'modified' || change.type === 'added') {
								if (docData.proposed_delivery_schedule && !docData.delivery_schedule_status) {
									console.log('Proposed delivery schedule received for order ' + docId);
									document.addEventListener('deviceready', function () {
										cordova.plugins.notification.local.schedule({
											title: 'Proposed delivery schedule received for order ' + docId,
											text: 'Click to open app',
											foreground: true
										});
									}, false);
								}
							}

						});
					});
			} else if (user.type === 'Reseller') {
				state.proposed_subscriber = COLLECTION
					.orders
					.where('resellerId', '==', user.uid)
					.onSnapshot((snapshot) => {
						snapshot.docChanges().forEach((change) => {
							const docData = change.doc.data();
							const docId = change.doc.id;

							const status = docData.delivery_schedule_status;

							if (change.type === 'modified') {
								if (status && status === 'accepted' && !docData.delivery_schedule_status_acknowledged) {
									console.log(`Order ${docId} delivery proposal has been accepted`);
									COLLECTION.orders.doc(docId).update({ delivery_schedule_status_acknowledged: true });
									document.addEventListener('deviceready', function () {
										cordova.plugins.notification.local.schedule({
											title: `Order ${docId} delivery proposal has been accepted`,
											text: 'Click to open app',
											foreground: true
										});
									}, false);
								} else if (status && status === 'declined' && !docData.delivery_schedule_status_acknowledged) {
									console.log(`Order ${docId} delivery proposal has been declined`);
									document.addEventListener('deviceready', function () {
										cordova.plugins.notification.local.schedule({
											title: `Order ${docId} delivery proposal has been declined`,
											text: 'Click to open app',
											foreground: true
										});
									}, false);
								}
							} else if (change.type === 'added') {
								if (status && status === 'accepted' && !docData.delivery_schedule_status_acknowledged) {
									console.log(`Order ${docId} delivery proposal has been accepted`);
									COLLECTION.orders.doc(docId).update({ delivery_schedule_status_acknowledged: true });
									document.addEventListener('deviceready', function () {
										cordova.plugins.notification.local.schedule({
											title: `Order ${docId} delivery proposal has been accepted`,
											text: 'Click to open app',
											foreground: true
										});
									}, false);
								} else if (status && status === 'declined' && !docData.delivery_schedule_status_acknowledged) {
									console.log(`Order ${docId} delivery proposal has been declined`);
									document.addEventListener('deviceready', function () {
										cordova.plugins.notification.local.schedule({
											title: `Order ${docId} delivery proposal has been declined`,
											text: 'Click to open app',
											foreground: true
										});
									}, false);
								}
							}

						});
					});
			}
		},
		async DELETE_ORDER({ }, id) {
			try {
				await COLLECTION.orders.doc(id).delete();
			} catch (error) {
				throw error;
			}
		},
		UNSUBSCRIBE_FROM_ORDERS({ dispatch, state }, ordersOnly = false) {
			if (state.subscriber) {
				if (ordersOnly) {
					state.subscriber();
				}
			}

			if (state.proposed_subscriber) {
				state.proposed_subscriber();
			}
		},
		UNSUBSCRIBE_FROM_CUSTOMER_ORDERS({ dispatch, state }) {
			if(state.customerSubscriber) {
				state.customerSubscriber();
			}
		}
	}
}

export default orders;
