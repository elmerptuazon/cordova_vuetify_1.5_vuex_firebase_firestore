import {
	DB,
	AUTH,
	STORAGE,
	COLLECTION
} from '@/config/firebaseInit';
import firebase from 'firebase/app';
import 'firebase/auth';
import loader from '@/assets/img/spinner.gif';
import malePlaceholder from '@/assets/img/male-default.jpg';
import femalePlaceholder from '@/assets/img/female-default.jpg';
const profPicStorageRef = STORAGE.ref('appsell').child('profile-pictures');

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return re.test(email)
}

const accounts = {
	namespaced: true,
	state: {
		user: {},
		userID: "",
		settings: {
			newMessages: true,
			catalogueUpdates: true,
			newOrders: true,
			deliverySchedules: true,
			newPromotions: true,
			saveToCameraRoll: false,
			calendarSync: true,
			contactsSortBy: 'first'
		},
		approvalSubscriber: null
	},
	getters: {
		user: state => state.user,
		settings: state => state.settings,
		GET_USER_TYPE: state => state.user.type,
		userReseller: state => state.user.resellerData,
		isApproved(state) {
			const user = state.user;

			if (user.type === 'Reseller' && user.status === 'pending') {
				return false;
			} else if (user.type === 'Reseller' && user.status === 'denied') {
				return false;
			} else {
				return true;
			}
		}
	},
	mutations: {
		SET_USER(state, payload) {
			state.user = Object.assign({}, payload)
		},
		SET_USERID(state, payload) {
			state.userID = payload
		},
		SET_USER_SETTINGS(state, payload) {
			state.settings = Object.assign({}, payload)
		},
		UPDATE_USER(state, payload) {
			state.user = Object.assign(state.user, payload)
		},
		SET_USER_RESELLER(state, reseller) {
			state.user.resellerData = Object.assign({}, reseller)
			state.user.resellerId = reseller.uid
		},
		UPDATE_PROFILE_PHOTO(state, payload) {
			payload.imageObj = {
				src: payload.downloadURL,
				loading: loader
			}
			state.user = Object.assign(state.user, payload)
		},
		UPDATE_PROOF_OF_ID(state, payload) {

			state.user.proofOfId = payload.proofOfId;

		},

		UPDATE_USER_KEY(state, { key, value }) {
			state.user[key] = value;
		}
	},
	actions: {
		async CREATE_ACCOUNT({ commit, state, dispatch, rootState }, payload) {
			try {

				// const contactSnapshot = (await COLLECTION.accounts.where('contact', '==', payload.contact).get()).docs.map(d => d);

				// if (contactSnapshot.length > 0) {
				// 	throw {
				// 		code: 'contact-already-in-use',
				// 		message: 'The contact number is already in use by another account'
				// 	}
				// }

				const response = await AUTH.createUserWithEmailAndPassword(payload.email, payload.password);
				delete payload.password;
				delete payload.confirmPassword;

				const user = AUTH.currentUser;

				await user.sendEmailVerification();

				// if (payload.displayPicture) {
				// 	const profPicSnapshot = await profPicStorageRef.child(response.user.uid).putString(payload.displayPicture, 'data_url');
				// 	delete payload.displayPicture;
				// 	const downloadURL = await profPicSnapshot.ref.getDownloadURL();
				// 	payload.hasPicture = true;
				// 	payload.downloadURL = downloadURL;
				// } else {
				// 	payload.hasPicture = false;
				// }

				if (payload.type === 'Reseller') {
					// if(payload.proofOfId) {
					// 	const proofOfIdSnapshot = await profPicStorageRef.child(`proof_${response.user.uid}`).putString(payload.proofOfId, 'data_url');
					// 	payload.proofOfId = await proofOfIdSnapshot.ref.getDownloadURL();
					// }

					payload.customers = [];
					payload.status = 'pending';
				}

				await COLLECTION.accounts.doc(response.user.uid).set(payload);
				payload.uid = response.user.uid;
				// const src = payload.gender === 'Male' ? malePlaceholder : femalePlaceholder;

				// payload.imageObj = {
				// 	src,
				// 	loading: loader
				// }

				// if (payload.hasPicture) {
				// 	payload.imageObj.src = payload.downloadURL;
				// }

				if (payload.type === 'Reseller') {
					try {
						await DB.collection('conversations').add({
							created: Date.now(),
							updated: Date.now(),
							opened: {
								[payload.uid]: true,
								[rootState.webAdminId]: true
							},
							users: [payload.uid, rootState.webAdminId]
						});
					} catch (error) {
						console.log(error)
					}

					localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify([]));
				}

				commit('SET_USER', payload);

				// if (payload.type === 'Reseller') {
				// 	dispatch('START_OBSERVERS', payload);
				// }

				return payload;
			} catch (error) {
				throw error;
			}
		},

		async UPLOAD_PROFILE_PHOTO({ commit }, payload) {
			try {
				if (payload.displayPicture) {
					const profPicSnapshot = await profPicStorageRef.child(payload.uid).putString(payload.displayPicture, 'data_url');
					delete payload.displayPicture;
					const downloadURL = await profPicSnapshot.ref.getDownloadURL();
					payload.hasPicture = true;
					payload.downloadURL = downloadURL;

				} else {
					payload.hasPicture = false;
					payload.downloadURL = null;
				}

				const src = payload.gender === 'Male' ? malePlaceholder : femalePlaceholder;
				payload.imageObj = {
					src,
					loading: loader
				}

				if (payload.hasPicture) {
					payload.imageObj.src = payload.downloadURL;
				}

				if (payload.hasPicture) {
					try {
						await COLLECTION.accounts
							.doc(payload.uid)
							.update(
								{
									downloadURL: payload.downloadURL,
									hasPicture: payload.hasPicture,
								}
							)
						commit('UPDATE_USER', payload);
					}
					catch (error) {
						console.log(error);
						throw error;
					}
				}

				return payload;
			}
			catch (error) {
				throw error;
			}
		},

		async UPLOAD_PROOF_OF_ID({ commit }, payload) {
			try {
				if (payload.type === 'Reseller' && payload.proofOfId) {
					const proofOfIdSnapshot = await profPicStorageRef.child(`proof_${payload.uid}`).putString(payload.proofOfId, 'data_url');
					payload.proofOfId = await proofOfIdSnapshot.ref.getDownloadURL();
				}

				try {
					await COLLECTION.accounts.doc(payload.uid).update({ proofOfId: payload.proofOfId });
					commit('UPDATE_USER', payload);
				}
				catch (error) {
					console.log(error);
					throw error;
				}

				return payload;
			}
			catch (error) {
				throw error;
			}

		},

		async FIND_RESELLER({ commit }, payload) {
			try {
				const type = validateEmail(payload.data) ? 'email' : 'agentId';

				// if (type === 'email') {
				// 	payload.data = payload.data.toLowerCase();
				// }

				const querySnapshot = await COLLECTION.accounts.where(type, '==', payload.data).limit(1).get();

				if (querySnapshot.empty) {
					return { empty: true }
				} else {

					const data = querySnapshot.docs.map((documentSnapshot) => {
						const d = documentSnapshot.data()
						d.uid = documentSnapshot.id
						return d
					});

					return {
						empty: false,
						data: data[0]
					}

				}
			} catch (error) {
				throw error
			}
		},

		async FIND_RESELLER_BY_ID({ commit }, id) {
			try {

				const querySnapshot = await COLLECTION.accounts
					.where('agentId', '==', id)
					.get();

				if (querySnapshot.empty) {
					return { success: false }
				} else {

					const data = querySnapshot.docs.map((documentSnapshot) => {
						const d = documentSnapshot.data()
						d.uid = documentSnapshot.id
						return d
					});

					return {
						success: true,
						data: data[0]
					}

				}
			} catch (error) {
				throw error
			}
		},

		async ADD_CUSTOMER_TO_RESELLER({ commit, state }, payload) {
			try {
				const newCustomer = {};
				newCustomer[payload.customerId] = true;
				payload.customers.push(newCustomer);

				// check if customer exists in old reseller
				if (state.user.hasOwnProperty('resellerId') && state.user.resellerId) {
					const oldResellerDoc = await COLLECTION.accounts.doc(state.user.resellerId).get()
					if (oldResellerDoc.exists) {
						const currentResellerCustomers = oldResellerDoc.data().customers
						const i = currentResellerCustomers.findIndex((c) => c[payload.customerId] === true)
						console.log(i)
						if (i >= 0) currentResellerCustomers.splice(i, 1)
						await COLLECTION.accounts.doc(state.user.resellerId).update({
							customers: currentResellerCustomers
						})
					}
				}

				// update reseller id list of customers
				await COLLECTION.accounts.doc(payload.resellerId).update({
					customers: payload.customers
				});

				// update customer reseller
				await COLLECTION.accounts.doc(payload.customerId).update({
					resellerId: payload.resellerId
				});

				// check if customer already has reseller, then update the state
				if (payload.hasOwnProperty('resellerData')) {
					if (!payload.resellerData.hasPicture) {
						const rsrc = payload.resellerData.gender === 'Male' ? malePlaceholder : femalePlaceholder
						payload.resellerData.placeholder = rsrc
					}
					commit('SET_USER_RESELLER', payload.resellerData)
				} else {
					if (payload.resellerId) {
						payload.resellerData = {}
						const myReseller = await COLLECTION.accounts.doc(payload.resellerId).get()
						const myResellerData = myReseller.data()
						myResellerData.uid = myReseller.id
						payload.resellerData = Object.assign({}, myResellerData)
						if (!payload.resellerData.hasPicture) {
							const rsrc = payload.resellerData.gender === 'Male' ? malePlaceholder : femalePlaceholder
							payload.resellerData.placeholder = rsrc
						}
						commit('SET_USER_RESELLER', payload.resellerData)
					}
				}
			} catch (error) {
				throw error
			}
		},
		async GET_PROFILE_PICTURE(context, payload) {
			try {
				try {
					const url = await profPicStorageRef.child(payload).getDownloadURL();
					return {
						success: true,
						url
					};
				} catch (error) {
					console.log(error);
					return {
						success: false
					};
				}
			} catch (error) {
				throw error
			}
		},
		async LOGIN({ commit, dispatch }, payload) {
			try {
				let response = await AUTH.signInWithEmailAndPassword(payload.email, payload.password);
				console.log(response);
				console.log(AUTH.currentUser);
				console.log(AUTH.currentUser.emailVerified);
				if (AUTH.currentUser.emailVerified === false) {
					AUTH.signOut();
					const error = new Error("email not verified");
					error.code = "auth/email-not-verified"
					throw error;
				}
				else {
					const user = await COLLECTION.accounts.doc(response.user.uid).get();
					const userData = user.data();

					// get customer reseller data
					userData.uid = AUTH.currentUser.uid
					const src = userData.gender === 'Male' ? malePlaceholder : femalePlaceholder
					userData.imageObj = {
						src,
						loading: loader
					}

					if (userData.hasPicture) {
						userData.imageObj.src = userData.downloadURL
					}

					if (userData.type === 'Customer') {
						if (userData.resellerId) {
							userData.resellerData = {}
							const myReseller = await COLLECTION.accounts.doc(userData.resellerId).get()
							const myResellerData = myReseller.data()
							myResellerData.uid = myReseller.id
							userData.resellerData = Object.assign({}, myResellerData)
							if (!userData.resellerData.hasPicture) {
								const rsrc = userData.resellerData.gender === 'Male' ? malePlaceholder : femalePlaceholder
								userData.resellerData.placeholder = rsrc
							}
						}
					}

					// Set address object if address prop is missing
					if (!userData.address) {
						userData.address = {
							name: null,
							province: null,
							citymun: null,
							barangay: null
						}
					}

					// User settings
					if (localStorage.getItem(`${userData.uid}_settings`)) {
						const opts = JSON.parse(localStorage.getItem(`${userData.uid}_settings`));
						commit('SET_USER_SETTINGS', opts);
					} else {
						const opts = {
							newMessages: true,
							catalogueUpdates: true,
							newOrders: true,
							deliverySchedules: true,
							newPromotions: true,
							saveToCameraRoll: false,
							calendarSync: true,
							contactsSortBy: 'first'
						}
						localStorage.setItem(`${userData.uid}_settings`, JSON.stringify(opts))
						commit('SET_USER_SETTINGS', opts)
					}

					// offline_contacts
					const offlineContactsSnapshot = await COLLECTION.offline_contacts.doc(response.user.uid).get();

					if (offlineContactsSnapshot.exists) {
						const offlineContacts = localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`);
						if (offlineContacts) {
							const contacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));

							offlineContactsSnapshot.data().data.forEach((c) => {
								const index = contacts.findIndex(x => x.id === c.id);
								if (index === -1) {
									contacts.push(c);
								}

								localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify(contacts));
							});
						} else {
							localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify(offlineContactsSnapshot.data().data));
						}
					} else {
						if (localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)) {
							await dispatch('contacts/SYNC_OFFLINE_CUSTOMERS', null, { root: true });
						}
					}

					await dispatch('stock_orders/GET', null, { root: true });

					commit('SET_USER', userData);
					commit('SET_USERID', response.user.uid)

					dispatch('START_OBSERVERS', userData);
					return userData;
				}

			} catch (error) {
				throw error
			}
		},
		async START_OBSERVERS({ state, dispatch }, userData) {
			if (userData.type === 'Reseller') {
				if (userData.status === 'approved') {
					dispatch('providers/ListenToPaymentProvider', null, { root: true })
					dispatch('providers/ListenToLogisticsProvider', null, { root: true })
					if (state.settings.newOrders) {
						dispatch('orders/LISTEN_TO_ORDERS', { id: userData.uid }, { root: true });
						dispatch('stock_orders/LISTEN_TO_STOCK_ORDERS', null, { root: true });
					}
					if (state.settings.catalogueUpdates) {
						dispatch('catalogues/LISTEN_TO_NEW_CATALOGUES', null, { root: true });
					}
				}
				if (userData.status && !state.approvalSubscriber && userData.status === 'pending') {
					dispatch('LISTEN_TO_APPROVAL');
				}
			}
			else {
				if (state.settings.catalogueUpdates) {
					dispatch('catalogues/LISTEN_TO_NEW_CATALOGUES', null, { root: true });
				}
			}

			if (state.settings.newMessages) {
				dispatch('conversations/LISTEN_TO_MESSAGES', null, { root: true });
			}

			if (state.settings.deliverySchedules) {
				dispatch('orders/LISTEN_TO_PROPOSED_DELIVERIES', { id: userData.uid }, { root: true });
			}

		},
		async UPDATE_ACCOUNT({ commit }, payload) {
			console.log(payload)
			const user = AUTH.currentUser
			try {

				const customerPayload = {
					birthday: payload.birthday,
					contact: payload.contact,
					updatedAt: Date.now(),
					email: payload.email,
					firstName: payload.firstName,
					gender: payload.gender,
					hasPicture: payload.hasPicture,
					lastName: payload.lastName,
					middleInitial: payload.middleInitial ? payload.middleInitial : null,
					resellerId: payload.resellerId,
					type: payload.type,
					address: payload.address,
					social: payload.social || {},
					isEmailAutogenerated: payload.isEmailAutogenerated || null
				}

				const resellerPayload = {
					birthday: payload.birthday,
					contact: payload.contact,
					updatedAt: Date.now(),
					email: payload.email,
					firstName: payload.firstName,
					gender: payload.gender,
					hasPicture: payload.hasPicture,
					lastName: payload.lastName,
					middleInitial: payload.middleInitial ? payload.middleInitial : null,
					agentId: payload.agentId ? payload.agentId : null,
					type: payload.type,
					address: payload.address,
					social: payload.social || {},
					isEmailAutogenerated: payload.isEmailAutogenerated || null
				}

				const userPayload = payload.type === 'Reseller' ? resellerPayload : customerPayload
				// check if email will be updated
				if (user.email !== payload.email) {
					const response = await user.updateEmail(payload.email)
					console.log('email updated')
				}
				// check if contact exists
				const querySnapshot = await COLLECTION.accounts.where('contact', '==', payload.contact).get()
				let accounts = querySnapshot.docs.map((doc) => {
					const docData = doc.data()
					docData.uid = doc.id
					return docData
				})
				if (accounts.length > 0) {
					console.log(accounts[0].email, user.email)
					// if contact exists
					if (accounts[0].email === user.email) {
						// if contact email is equal to current user email
						const updatedUser = await COLLECTION.accounts.doc(payload.uid).update(userPayload)
						commit('UPDATE_USER', userPayload)
					} else {
						// if found account id is equal to logged in user id
						if (accounts[0].uid === user.uid) {
							const updatedUser = await COLLECTION.accounts.doc(payload.uid).update(userPayload)
							commit('UPDATE_USER', userPayload)
						} else {
							throw {
								message: 'Contact number already exists.'
							}
						}
					}
				} else {
					// if contact does not exist
					const updatedUser = await COLLECTION.accounts.doc(payload.uid).update(userPayload)
					commit('UPDATE_USER', userPayload)
				}

			} catch (e) {
				console.error(e)
				throw e
			}
		},
		async UPDATE_PROFILE_PHOTO({ commit }, dataUrl) {
			try {
				console.log('dataUrl', dataUrl)
				const user = AUTH.currentUser;
				const profPicSnapshot = await profPicStorageRef.child(user.uid).putString(dataUrl, 'data_url');
				const downloadURL = await profPicSnapshot.ref.getDownloadURL();
				const payload = {
					hasPicture: true,
					downloadURL: downloadURL
				}
				const response = await COLLECTION.accounts.doc(user.uid).update(payload);
				commit('UPDATE_PROFILE_PHOTO', payload);
			} catch (e) {
				throw e;
			}
		},
		async UPDATE_PROOF_OF_ID({ commit }, dataUrl) {
			try {
				console.log('dataUrl', dataUrl)
				const user = AUTH.currentUser;
				const proofOfIdSnapshot = await profPicStorageRef.child(`proof_${user.uid}`).putString(dataUrl, 'data_url');
				const downloadURL = await proofOfIdSnapshot.ref.getDownloadURL();
				const payload = {
					proofOfId: downloadURL
				}
				const response = await COLLECTION.accounts.doc(user.uid).update(payload);
				commit('UPDATE_PROOF_OF_ID', payload);
			} catch (e) {
				throw e;
			}
		},
		async RE_AUTHENTICATE_USER({ }, password) {
			try {
				const user = await AUTH.currentUser;
				const credentials = await firebase.auth.EmailAuthProvider.credential(user.email, password);
				await user.reauthenticateAndRetrieveDataWithCredential(credentials);
			} catch (e) {
				throw e;
			}
		},

		async UPDATE_PASSWORD({ commit, dispatch }, newPassword) {
			try {
				const user = AUTH.currentUser
				await user.updatePassword(newPassword);
			} catch (e) {
				throw e;
			}
		},

		async LOG_OUT({ rootState, commit, state, dispatch }) {
			try {
				const user = AUTH.currentUser;
				// SET USER TO AN EMPTY OBJECT
				commit('SET_USER', {});
				// EMPTY CATALOGUES
				commit('catalogues/SET_LIST', [], { root: true });
				// SET CATALOGUE LOADED STATUS TO FALSE
				commit('catalogues/SET_LOADED', false, { root: true });
				// UNSUBSCRIBE TO ORDERS
				if (rootState.orders.subscriber && state.settings.newOrders) {
					dispatch('orders/UNSUBSCRIBE_FROM_ORDERS', {}, { root: true });
					dispatch('stock_orders/UNSUBSCRIBE_FROM_STOCK_ORDERS', {}, { root: true });
				}
				// UNSUBSCRIBE TO CATALOGUES
				if (state.settings.catalogueUpdates) {
					dispatch('catalogues/UNSUBSCRIBE_FROM_CATALOGUES', {}, { root: true });
				}
				//UNSUBSCRIBE TO PROVIDERS
				if(user.type === 'Reseller') {
					commit('providers/UnsubscribeToPaymentSubscriber', null, { root: true })
					commit('providers/UnsubscribeToLogisticsSubscriber', null, { root: true })
				}
				return await AUTH.signOut();
			} catch (error) {
				throw error;
			}
		},

		async RESET_PASSWORD({ }, payload) {
			try {
				const response = await AUTH.sendPasswordResetEmail(payload);
				return response;
			} catch (error) {
				throw error;
			}
		},

		async RELOAD_USER_DATA({ commit, dispatch }, payload) {
			try {
				// GET USER DATA WHEN RELOADED, AND ALSO HIS RESELLER DATA
				const user = await COLLECTION.accounts.doc(payload).get();
				const userData = user.data();
				// GET CUSTOMER RESELLER DATA
				userData.uid = AUTH.currentUser.uid;
				// SET PLACEHOLDER PROFILE PICTURE
				const src = userData.gender === 'Male' ? malePlaceholder : femalePlaceholder;
				userData.imageObj = {
					src,
					loading: loader
				}
				// IF USER HAS PICTURE, GET THE PICTURE PROPERTY
				if (userData.hasPicture) userData.imageObj.src = userData.downloadURL
				if (userData.type === 'Customer') {
					// IF USER HAS RESELLER, GET THE RESELLER PROFILE DATA
					if (userData.resellerId) {
						userData.resellerData = {}
						const myReseller = await COLLECTION.accounts.doc(userData.resellerId).get()
						userData.resellerData = Object.assign({}, myReseller.data())
						userData.resellerData.uid = myReseller.id
						if (userData.resellerData.hasPicture) {
							const rsrc = userData.resellerData.gender === 'Male' ? malePlaceholder : femalePlaceholder
							userData.resellerData.imageObj = {
								src: rsrc,
								loading: loader
							}
							userData.resellerData.imageObj.src = userData.resellerData.downloadURL
						}
					}
				}

				// Set address object if address prop is missing
				if (!userData.address) {
					userData.address = {
						name: null,
						province: null,
						citymun: null,
						barangay: null
					}
				}

				// User Settings
				if (localStorage.getItem(`${userData.uid}_settings`)) {
					const opts = JSON.parse(localStorage.getItem(`${userData.uid}_settings`))
					commit('SET_USER_SETTINGS', opts)
				} else {
					const opts = {
						newMessages: true,
						catalogueUpdates: true,
						newOrders: true,
						deliverySchedules: true,
						newPromotions: true,
						saveToCameraRoll: false,
						calendarSync: true,
						contactsSortBy: 'first'
					}
					localStorage.setItem(`${userData.uid}_settings`, JSON.stringify(opts))
					commit('SET_USER_SETTINGS', opts)
				}

				commit('SET_USER', userData);
				commit('SET_USERID', payload)
				dispatch('START_OBSERVERS', userData);
				dispatch('catalogues/GET_LIST', {}, { root: true });
			} catch (error) {
				throw error
			}
		},

		async GET_USER({ }, uid) {
			try {
				const user = await COLLECTION.accounts.doc(uid).get();
				const userData = user.data();
				userData.id = user.id;
				return userData;
			} catch (error) {
				throw error;
			}
		},

		async GET_CUSTOMERS({ }, payload) {
			try {

				const querySnapshot = await COLLECTION.accounts
					.where('resellerId', '==', AUTH.currentUser.uid)
					.get();

				const customers = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});

				return customers;
			} catch (error) {
				throw error;
			}
		},

		async RESUBMIT_STATUS({ commit, dispatch }) {
			const uid = AUTH.currentUser.uid;
			try {
				await COLLECTION.accounts.doc(uid).update({ status: 'pending' });
				commit('UPDATE_USER_KEY', { key: 'status', value: 'pending' });
				dispatch('LISTEN_TO_APPROVAL');
				return;
			} catch (error) {
				throw error;
			}
		},

		LISTEN_TO_APPROVAL({ state, commit, dispatch }) {
			const uid = AUTH.currentUser.uid;
			console.log('Listening to approvals')

			state.approvalSubscriber = COLLECTION.accounts.doc(uid).onSnapshot(function (doc) {
				const data = doc.data();

				let notif = {};
				//console.log(data.status);
				if (data.status === 'approved') {
					notif.title = 'Congratulations!';
					notif.text = 'Your distributor registration request has been approved!';
					dispatch('RELOAD_USER_DATA', uid);
					dispatch('SEND_PUSH_NOTIFICATION', notif);
					console.log("Unsubscribing to approvals");
					state.approvalSubscriber();
				} else if (data.status === 'denied') {
					notif.title = 'Sorry';
					notif.text = 'Your distributor registration request has been denied.';
					commit('UPDATE_USER_KEY', { key: 'remarks', value: data.remarks });
					dispatch('RELOAD_USER_DATA', uid);
					dispatch('SEND_PUSH_NOTIFICATION', notif);
				}

				// console.log('Approval listener:');
				// console.log(title, text);


				commit('UPDATE_USER_KEY', { key: 'status', value: data.status });
			});
		},

		SEND_PUSH_NOTIFICATION({ }, payload) {
			document.addEventListener('deviceready', function () {
				cordova.plugins.notification.local.schedule({
					title: payload.title,
					text: payload.text,
					foreground: true,
					vibrate: true
				});
			}, false);
		},

		CHECK_OBSERVERS({ rootState, state, dispatch }, payload) {

			const user = AUTH.currentUser;

			if (state.user.type === 'Reseller') {
				if (state.settings.newOrders && !rootState.orders.subscriber) {
					dispatch('orders/LISTEN_TO_ORDERS', { id: user.uid }, { root: true });
					dispatch('stock_orders/LISTEN_TO_STOCK_ORDERS', null, { root: true });
				}

				if (!state.settings.newOrders) {
					dispatch('orders/UNSUBSCRIBE_FROM_ORDERS', true, { root: true });
					dispatch('stock_orders/UNSUBSCRIBE_FROM_STOCK_ORDERS', null, { root: true });
				}


			}

			if (state.settings.newMessages) {
				dispatch('conversations/LISTEN_TO_MESSAGES', null, { root: true });
			}
			//Add unsubscriber here for messages


			if (state.settings.deliverySchedules && !rootState.orders.proposed_subscriber) {
				dispatch('orders/LISTEN_TO_PROPOSED_DELIVERIES', { id: user.uid }, { root: true });
			}

			if (!state.settings.deliverySchedules && rootState.orders.proposed_subscriber) {
				dispatch('orders/UNSUBSCRIBE_FROM_ORDERS', false, { root: true });
			}

			if (state.settings.catalogueUpdates && !rootState.catalogues.subscriber) {
				dispatch('catalogues/LISTEN_TO_NEW_CATALOGUES', null, { root: true });
			}

			if (!state.settings.catalogueUpdates && !rootState.catalogues.subscriber) {
				dispatch('catalogues/UNSUBSCRIBE_FROM_CATALOGUES', null, { root: true });
			}


		},

		UPDATE_USER_SETTINGS({ commit, dispatch }, payload) {
			dispatch('CHECK_OBSERVERS');
			const uid = AUTH.currentUser.uid;
			localStorage.setItem(`${uid}_settings`, JSON.stringify(payload));
		}
	}
}

export default accounts
