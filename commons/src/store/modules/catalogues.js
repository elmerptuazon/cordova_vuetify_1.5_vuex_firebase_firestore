import { COLLECTION } from '@/config/firebaseInit';

const catalogues = {
	namespaced: true,
	state: {
		list: [],
		subscriber: null,
		loaded: false
	},
	getters: {
		GET_LIST(state) {
			state.list.forEach((item) => {
				if (!item.position) {
					item.position = 0;
				}
			});

			return state.list.sort((a, b) => parseFloat(a.position) - parseFloat(b.position));
		},
		IS_LOADED: state => state.loaded
	},
	mutations: {
		SET_LIST(state, payload) {
			state.list = payload
		},
		SET_IMAGE_LOADED(state, alt) {
			const i = state.list.findIndex((l) => l.id === alt);
			state.list[i].imageLoaded = true;
		},
		SET_LOADED(state, payload) {
			state.loaded = payload;
		}
	},
	actions: {
		async GET_LIST({ commit, state }) {

			if (state.loaded) {
				console.log('Catalogue already loaded.');
				return;
			}

			try {
				const querySnapshot = await COLLECTION.catalogues
					.where('active', '==', 1)
					.get();


				const catalogues = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.id = documentSnapshot.id;
					return data;
				});

				commit('SET_LIST', catalogues);
				commit('SET_LOADED', true);

				return catalogues;
			} catch (error) {
				throw error;
			}
		},
		LISTEN_TO_NEW_CATALOGUES({ rootState, state, dispatch }) {
			const storageCode = rootState.storageCode;
			state.subscriber = COLLECTION.catalogues.onSnapshot((snapshot) => {
				let changes = snapshot.docChanges().filter(c => c.type === 'added');
				changes = changes.map((change) => {
					const orderData = change.doc.data();
					orderData.id = change.doc.id;
					return orderData;
				});

				const storagePath = `${storageCode}_categories`;

				// set fresh storage with current catalogue ids if storage is not set
				if (!localStorage.getItem(storagePath)) {
					const ids = changes.map(c => c.id);
					localStorage.setItem(storagePath, JSON.stringify(ids));
					return;
				}

				changes.forEach((change) => {
					const category_ids = JSON.parse(localStorage.getItem(storagePath));
					const exists = category_ids.find(id => id == change.id);

					if (!exists) {
						category_ids.push(change.id);
						// set storage again to new category_ids array
						localStorage.setItem(storagePath, JSON.stringify(category_ids));
						const notif = {
							title: 'New Category has been added!',
							text: `Category name: ${change.name || ''}\nClick this to open the app.`,
							redirectURL: '/catalogue',
						};

						dispatch('accounts/SEND_PUSH_NOTIFICATION', notif, { root: true });
					}
				});
			});
		},
		UNSUBSCRIBE_FROM_CATALOGUES({ dispatch, state }) {
			if (state.subscriber) {
				state.subscriber();
			}
		}
	}
}

export default catalogues;
