import { DB, AUTH, STORAGE, COLLECTION, FIRESTORE } from '@/config/firebaseInit';

function GenerateStockOrderNumber(resellerID) {
	var refNumber = `SO-${BigInt(resellerID).toString(36).toUpperCase()}${BigInt(Date.now()).toString(36).toUpperCase()}`;
	return refNumber;
}

export default {
	namespaced: true,
	state: {
		basket: 0,
		subscriber: null
	},
	mutations: {
		SET_BASKET_COUNT(state, payload) {
			state.basket = payload;
		}
	},
	actions: {
		async GET({ commit }) {
			try {

				const userId = AUTH.currentUser.uid;

				const querySnapshot = await COLLECTION
					.stock_orders
					.where('userId', '==', userId)
					.where('active', '==', true)
					.get();

				if (!querySnapshot.empty) {

					const data = querySnapshot.docs.map((documentSnapshot) => {
						const data = documentSnapshot.data();
						data.id = documentSnapshot.id;
						return data;
					});

					for (let product of data[0].items) {

						const productRef = await COLLECTION.products.doc(product.productId).get();

						if (productRef.exists) {

							const productData = productRef.data();

							const keys = Object.keys(product.attributes).sort();

							let unique = '';

							keys.forEach((key) => {
								if (key !== 'qty' && key !== 'quantity') {
									unique += `_${key}:${product.attributes[key]}`;
								}
							});
							// product.resellerPrice = productData.resellerPrice;

							const variantRef = await DB.collection('products').doc('details').collection('variants')
							.doc(product.variantId)
							.get();

							if(variantRef.exists) {
								const variantData = variantRef.data();

								product.isOutofStock = variantData.isOutofStock;
								product.onHandQTY = variantData.onHandQTY;
								product.allocatedQTY = variantData.allocatedQTY;
								product.availableQTY = Number(variantData.onHandQTY) - Number(variantData.allocatedQTY)
							}

							product.price = productData.price;
							product.image = productData.downloadURL;
							product.name = productData.name;
							product.unique = product.productId + unique;
							product.weight = productData.weight;

						}

					}

					commit('SET_BASKET_COUNT', data[0].items.length);

					return {
						success: true,
						data: data[0]
					}
				} else {
					return {
						success: false,
						message: 'No active stock orders'
					}
				}

			} catch (error) {
				throw error;
			}
		},
		async SAVE({ commit, rootGetters }, payload) {
			try {

				const userId = AUTH.currentUser.uid;

				// Get curret stock order
				const querySnapshot = await COLLECTION
					.stock_orders
					.where('userId', '==', userId)
					.where('active', '==', true)
					.get();

				if (!querySnapshot.empty) {

					const data = querySnapshot.docs.map((documentSnapshot) => {
						const data = documentSnapshot.data();
						data.id = documentSnapshot.id;
						return data;
					});

					const currentStockOrder = data[0];

					payload.items.forEach((item) => {

						console.log(item)

						const keys = Object.keys(item.attributes).sort();

						let unique = '';

						keys.forEach((key) => {
							if (key !== 'qty') {
								unique += `_${key}:${item.attributes[key]}`;
							}
						});

						unique = item.productId + unique;

						const index = currentStockOrder.items.findIndex(i => i.unique == unique);

						if (index !== -1) {

							currentStockOrder.items[index].qty = item.qty;

						} else {

							item.unique = unique;
							currentStockOrder.items.push(item);

						}

					});

					await COLLECTION.stock_orders.doc(currentStockOrder.id).update({ items: currentStockOrder.items });

					for (let item of currentStockOrder.items) {

						const productRef = await COLLECTION.products.doc(item.productId).get();

						if (productRef.exists) {

							const productData = productRef.data();

							item.price = productData.price;
							item.image = productData.downloadURL;
							item.name = productData.name;

						}

					}

					commit('SET_BASKET_COUNT', currentStockOrder.items.length);

					return {
						status: 'updated',
						items: currentStockOrder.items
					}

				} else {

					// remove dependency
					const payloadCopy = Object.assign({}, payload);
					const userDetails = rootGetters['accounts/user'];
					console.log(payload);
					payload.userId = AUTH.currentUser.uid;
					payload.stockOrderReference = GenerateStockOrderNumber(userDetails.agentId);
					payload.items.forEach((item) => {

						// add unique identifier

						const keys = Object.keys(item.attributes).sort();

						item.unique = '';

						keys.forEach((key) => {
							if (key !== 'qty') {
								item.unique += `_${key}:${item.attributes[key]}`;
							}
						});

						item.unique = item.productId + item.unique;

					});



					const doc = await COLLECTION.stock_orders.add(payload);

					for (let item of payload.items) {

						const productRef = await COLLECTION.products.doc(item.productId).get();

						if (productRef.exists) {

							const productData = productRef.data();

							item.price = productData.price;
							item.image = productData.downloadURL;
							item.name = productData.name;

						}

					}

					commit('SET_BASKET_COUNT', payload.items.length);

					return {
						status: 'created',
						doc: doc.id,
						data: payload
					}

				}

			} catch (error) {
				throw error;
			}
		},
		async SAVE_ITEM_FROM_INVENTORY({ commit, rootGetters }, payload) {
			try {

				const userId = AUTH.currentUser.uid;
				const userDetails = rootGetters['accounts/user'];
				const querySnapshot = await COLLECTION
					.stock_orders
					.where('userId', '==', userId)
					.where('active', '==', true)
					.get();

				if (!querySnapshot.empty) {


					const data = querySnapshot.docs.map((documentSnapshot) => {
						const data = documentSnapshot.data();
						data.id = documentSnapshot.id;
						return data;
					});

					const currentStockOrder = data[0];

					const keys = Object.keys(payload.attributes).sort();

					let unique = '';

					keys.forEach((key) => {
						if (key !== 'quantity' && key !== 'qty') {
							unique += `_${key}:${payload.attributes[key]}`;
						}
					});

					unique = payload.productId + unique;

					const index = currentStockOrder.items.findIndex(i => i.unique === unique);

					if (index !== -1) {

						currentStockOrder.items[index].qty += payload.attributes.quantity;
						currentStockOrder.items[index].variantId = payload.variant.id;
						currentStockOrder.items[index].variantName = payload.variant.name;
						currentStockOrder.items[index].sku = payload.variant.sku;

					} else {

						const item = {
							attributes: payload.attributes,
							productId: payload.productId,
							qty: payload.attributes.quantity,
							unique: unique,
							variantId: payload.variant.id,
							variantName: payload.variant.name,
							sku: payload.variant.sku,
						}

						currentStockOrder.items.push(item);

					}

					commit('SET_BASKET_COUNT', currentStockOrder.items.length);

					await COLLECTION.stock_orders.doc(currentStockOrder.id).update({ items: currentStockOrder.items });

					return {
						success: true,
						message: 'Item added to stock orders'
					}

				} else {

					const obj = {
						active: true,
						items: [],
						userId: userId,
						createdAt: Date.now(),
						stockOrderReference: GenerateStockOrderNumber(userDetails.agentId)
					}

					const keys = Object.keys(payload.attributes).sort();
					let unique = '';

					keys.forEach((key) => {
						if (key !== 'quantity' && key !== 'qty') {
							unique += `_${key}:${payload.attributes[key]}`;
						}
					});
					unique = payload.productId + unique;

					obj.items.push({
						attributes: payload.attributes,
						productId: payload.productId,
						qty: payload.attributes.quantity,
						unique: unique,
						variantId: payload.variant.id,
						variantName: payload.variant.name,
						sku: payload.variant.sku,
					});

					commit('SET_BASKET_COUNT', 1);

					const doc = await COLLECTION.stock_orders.add(obj);

					return {
						success: true,
						message: 'Item added to stock orders'
					}

				}

			} catch (error) {
				throw error;
			}
		},
		async UPDATE_ITEM({ }, payload) {
			try {

				const userId = AUTH.currentUser.uid;

				const querySnapshot = await COLLECTION
					.stock_orders
					.where('userId', '==', userId)
					.where('active', '==', true)
					.get();

				if (!querySnapshot.empty) {

					const data = querySnapshot.docs.map((documentSnapshot) => {
						const data = documentSnapshot.data();
						data.id = documentSnapshot.id;
						return data;
					});

					const currentStockOrder = data[0];

					const index = currentStockOrder.items.findIndex(i => i.unique === payload.unique);

					if (index !== -1) {

						currentStockOrder.items[index].qty = payload.qty;

					}

					await COLLECTION.stock_orders.doc(currentStockOrder.id).update({ items: currentStockOrder.items });

					return {
						success: true,
						message: 'Item updated'
					}

				}

			} catch (error) {
				throw error;
			}
		},
		async DELETE_ITEM({ commit }, unique) {
			try {

				const userId = AUTH.currentUser.uid;

				const querySnapshot = await COLLECTION
					.stock_orders
					.where('userId', '==', userId)
					.where('active', '==', true)
					.get();

				if (!querySnapshot.empty) {

					const data = querySnapshot.docs.map((documentSnapshot) => {
						const data = documentSnapshot.data();
						data.id = documentSnapshot.id;
						return data;
					});

					const currentStockOrder = data[0];

					const index = currentStockOrder.items.findIndex(function (i) {
						if (i.unique) return i.unique === unique;

						// if unique attribute missing
						return i.productId === unique;
					});

					if (index !== -1) {

						currentStockOrder.items.splice(index, 1);
						commit('SET_BASKET_COUNT', currentStockOrder.items.length);

						await COLLECTION.stock_orders.doc(currentStockOrder.id).update({ items: currentStockOrder.items });

						return {
							success: true,
							message: 'Item removed'
						}

					} else {
						return {
							success: false
						}
					}

				}

			} catch (error) {
				throw error;
			}
		},

		async DELETE_ALL_ITEMS({ commit }, stockOrderId) {
			try {
				await COLLECTION.stock_orders.doc(stockOrderId).update({ items: [] });
				commit('SET_BASKET_COUNT', 0);

			} catch(error) {
				console.log(error);
				throw error;
			}

		},	

		async SUBMIT({ commit }, stockOrder) {

			for(let item of stockOrder.items) {

				await DB.collection('products').doc('details')
				.collection('variants').doc(item.variantId)
				.update({
					allocatedQTY: FIRESTORE.FieldValue.increment(item.qty),
				});

				delete item.attributes.qty;
				delete item.attributes.quantity;
				delete item.name;
				delete item.image;

				if(!item.hasOwnProperty('weight') || item.weight === undefined) {
					item.weight = 0;
				}
			}

			commit('SET_BASKET_COUNT', 0);

			const submittedAt = Date.now();
			await COLLECTION.stock_orders.doc(stockOrder.id).update({
				active: false,
				submittedAt,
				status: 'pending',
				items: stockOrder.items,
				paymentDetails: stockOrder.paymentDetails,
				logisticsDetails: stockOrder.logisticsDetails,
				isRead: stockOrder.isRead,
			});



			return {
				success: true,
				submittedAt
			}
		},

		async SUBMIT_CALLBACK({ commit }, stockOrder) {

			for (let product of stockOrder.items) {

				await DB.collection('products').doc('details')
				.collection('variants').doc(product.variantId)
				.update({
					allocatedQTY: FIRESTORE.FieldValue.increment(product.qty),
				});

				const productRef = await COLLECTION.products.doc(product.productId).get();

				if (productRef.exists) {

					const productData = productRef.data();
					// product.resellerPrice = productData.resellerPrice;
					product.price = productData.price;
					product.weight = productData.weight;
				}

			}

			stockOrder.items = stockOrder.items.map((item) => {
				delete item.attributes.qty;
				delete item.attributes.quantity;
				delete item.name;
				delete item.image;
				return item;
			});

			commit('SET_BASKET_COUNT', 0);

			const submittedAt = Date.now();
			await COLLECTION.stock_orders.doc(stockOrder.id).update({
				active: false,
				submittedAt,
				status: 'pending',
				items: stockOrder.items,
			});



			return {
				success: true,
				submittedAt
			}

		},

		async MARKED_AS_ADDED_TO_INVENTORY({ }, id) {
			try {
				await COLLECTION.stock_orders.doc(id).update({ 'addedToInventory': true });
				return;
			} catch (error) {
				console.log(error);
				return {
					success: false
				}
			}
		},

		async FIND_ALL() {
			try {

				const userId = AUTH.currentUser.uid;

				const querySnapshot = await COLLECTION
					.stock_orders
					.where('userId', '==', userId)
					.where('active', '==', false)
					.get();

				const data = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.id = documentSnapshot.id;
					return data;
				});

				data.forEach((d) => {
					d.items.forEach((item) => {
						item.total = item.price * item.qty;
						item.resellerTotal = item.price * item.qty;
					});
				});

				return {
					success: true,
					data: data
				}

			} catch (error) {
				throw error;
			}
		},
		async FIND({ }, id) {
			try {

				const userId = AUTH.currentUser.uid;

				const doc = await COLLECTION
					.stock_orders
					.doc(id)
					.get();

				const data = doc.data();

				for (let product of data.items) {

					const productRef = await COLLECTION.products.doc(product.productId).get();

					if (productRef.exists) {

						const productData = productRef.data();

						product.price = productData.price;
						product.image = productData.downloadURL;
						product.name = productData.name;

					}

				}

				return {
					success: true,
					data: data
				}

			} catch (error) {
				throw error;
			}
		},

		LISTEN_TO_STOCK_ORDERS({ state, rootGetters }) {

			const user = AUTH.currentUser;

			state.subscriber = COLLECTION.stock_orders.where('userId', '==', user.uid)
				.onSnapshot((snapshot) => {

					console.log('Listening to stock orders...');

					let changes = snapshot.docChanges();

					changes = changes.map((change) => {
						const data = change.doc.data();
						data.id = change.doc.id;
						return data;
					});

					changes.forEach((change) => {

						if ((!change.read && change.status === 'cancelled') || (!change.read && change.status === 'processing')) {
							console.log('Unopened stock order', change);
							document.addEventListener('deviceready', function () {

								let message;

								if (change.status === 'processing') {
									message = `Thank you for your order! \n your order is currently being processed!`;
								} else if (change.status === 'cancelled') {
									message = `One of your orders was cancelled \nplease contact ${rootGetters["GET_COMPANY"]} if you have any questions.`;
								}

								cordova.plugins.notification.local.schedule({
									title: 'Order Status',
									text: message,
									foreground: true
								});
							}, false);
						}
					});

				});
		},

		UNSUBSCRIBE_FROM_STOCK_ORDERS({ state }) {
			if (state.subscriber) {
				state.subscriber();
			}
		},

		async UPDATE_STOCK_ORDER({ }, payload) {
			const { id, key, value } = payload;

			await COLLECTION.stock_orders.doc(id).update({ [key]: value });
		},

		async UPDATE_STOCK_ORDER_DETAILS({ }, payload) {
			try {
				const { id, updatedDetails } = payload;
				await COLLECTION.stock_orders.doc(id).update(updatedDetails);

			} catch(error) {
				throw error
			}
			
		},

		async TEMP_UPLOAD_PROOF_OF_PAYMENT({ }, payload) {
			try {
				const { picture, stockOrderReference } = payload;
				const uploadedPic = await STORAGE.ref('appsell')
					.child('proof-of-payment')
					.child(stockOrderReference)
					.putString(picture, 'data_url');
				
				return await uploadedPic.ref.getDownloadURL();

			} catch(error) {
				throw error;
			}
		},

		async REMOVE_PROOF_OF_PAYMENT({ }, stockOrderReference) {
			try {

				await STORAGE.ref('appsell')
					.child('proof-of-payment')
					.child(stockOrderReference)
					.delete();
				
				return { success: true };

			} catch(error) {
				throw error;
			}
		},

		async UPLOAD_PROOF_OF_PAYMENT({ }, payload) {
			const { id, paymentDetails } = payload;

			try {
				paymentDetails.paymentStatus = 'pending';

				await COLLECTION.stock_orders.doc(id).update({ 
					isRead: false,
					paymentDetails 
				});

				return paymentDetails;
			} catch(error) {
				throw error;
			}
		}

	}
}
