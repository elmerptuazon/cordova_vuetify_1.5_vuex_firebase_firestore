import { COLLECTION, AUTH } from '@/config/firebaseInit';

const inventory = {
	namespaced: true,
	state: {},
	mutations: {},
	actions: {
		async GET_INVENTORY({ }) {
			try {
				const user = AUTH.currentUser;
				const querySnapshot = await COLLECTION.inventory.where('resellerId', '==', user.uid).get()
				const items = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.id = data.productId;
					data.inventory_id = documentSnapshot.id;
					return data;
				});
				return items;
			} catch (error) {
				throw error;
			}
		},

		async ADD_TO_INVENTORY({ }, data) {
			try {
				const user = AUTH.currentUser;
				data.resellerId = user.uid;
				// generate unique value based on product id and attributes
				//mali yun ditoo.
				const itemAttributesCopy = JSON.parse(JSON.stringify(data.attributes));
				delete itemAttributesCopy.qty;
				delete itemAttributesCopy.quantity;
				const attributes = Object.values(itemAttributesCopy).sort();
				data.unique = data.productId + '_' + attributes.join('-');
				const querySnapshot = await COLLECTION.inventory.where('unique', '==', data.unique).where('resellerId', '==', user.uid).get();
				const snapshot = querySnapshot.docs.map((doc) => {
					const d = doc.data();
					d.id = doc.id;
					return d;
				});
				if (snapshot.length > 0) {
					return {
						exists: true,
						data: snapshot[0]
					};
				} else {
					const docRef = await COLLECTION.inventory.add(data);
					return {
						exists: false,
						docRef
					};
				}
			} catch (error) {
				throw error;
			}
		},

		async UPDATE_INVENTORY_ITEM({ }, { inventory_id, product_id, quantity, unique, attributes }) {
			try {
				const user = AUTH.currentUser;
				const querySnapshot = await COLLECTION.inventory.where('unique', '==', unique).where('resellerId', '==', user.uid).get();
				const data = querySnapshot.docs.map(doc => doc);
				if (data.length > 0) {
					await COLLECTION.inventory.doc(inventory_id).update({ inventory: quantity });
					return { quantity }
				} else {
					const docRef = await COLLECTION.inventory.add({
						inventory: quantity,
						net: 0,
						productId: product_id,
						resellerId: user.uid,
						unique,
						attributes
					});
					return {
						quantity,
						inventory_id: docRef.id
					}
				}
			} catch (error) {
				return error;
			}
		},

		async UPDATE_INVENTORY_NET({ }, order_id) {
			try {
				const resellerId = AUTH.currentUser.uid;
				const doc = await COLLECTION.orders.doc(order_id).get();
				if (doc.exists) {
					const basket = doc.data().basket;
					for (let item of basket) {

						// generate unique value based on product id and attributes
						const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
						delete itemAttributesCopy.qty;
						delete itemAttributesCopy.quantity;
						const attributes = Object.values(itemAttributesCopy).sort();
						const unique = item.product.id + '_' + attributes.join('-');
						// generate end

						const querySnapshot = await COLLECTION.inventory
							.where('unique', '==', unique)
							.where('resellerId', '==', resellerId)
							.get();

						const data = querySnapshot.docs.map((doc) => {
							const snapshot = doc.data();
							snapshot.net += item.attribute.qty;
							snapshot.id = doc.id;
							return snapshot;
						});

						if (data.length > 0) {
							let inventory;

							if (+data[0].inventory > +item.attribute.qty) {
								const left = +data[0].inventory - +item.attribute.qty;
								if (left >= 0) {
									inventory = left;
								} else {
									inventory = 0;
								}
							} else {
								inventory = 0;
							}

							await COLLECTION.inventory.doc(data[0].id).update({
								net: data[0].net,
								inventory: inventory
							});
						} else {
							console.log('RUN', attributes)
							await COLLECTION.inventory.add({
								inventory: 0,
								net: 0,
								productId: item.product.id,
								resellerId: resellerId,
								unique,
								attributes: item.attribute
							});
						}
					}
				}
			} catch (error) {
				throw error;
			}
		},

		async DELETE_INVENTORY_ITEM({ }, id) {
			try {
				await COLLECTION.inventory.doc(id).delete();
				return {
					success: true
				}
			} catch (e) {
				console.log(e)
				throw {
					success: false
				};
			}
		},

		async ADD_ITEMS_FROM_STOCK_ORDER({ dispatch }, items) {
			try {
				for (const item of items) {
					const response = await dispatch('ADD_TO_INVENTORY', {
						attributes: item.attributes,
						inventory: item.qty,
						net: 0,
						productId: item.productId
					});

					console.log(response)

					if (response.exists) {
						const data = response.data;
						const t = await dispatch('UPDATE_INVENTORY_ITEM', {
							inventory_id: data.id,
							product_id: item.productId,
							quantity: item.qty += data.inventory,
							unique: data.unique
						});
					}
				}

				return {
					success: true
				}
			} catch (error) {
				console.log(error);
				throw {
					success: false
				}
			}
		}
	}
}

export default inventory;

