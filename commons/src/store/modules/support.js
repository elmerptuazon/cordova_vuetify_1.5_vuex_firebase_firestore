import { DB, AUTH, COLLECTION } from '@/config/firebaseInit';

const support = {
	namespaced: true,
	state: {},
	mutations: {},
	actions: {
		async SEND_MESSAGE ({ rootState }, message) {
			const user = AUTH.currentUser;
			const obj = {
				createdAt: Date.now(),
				message,
				opened: false,
				uid: user.uid
			}

			try {
				await COLLECTION.support.add(obj);
				return;
			} catch (error) {
				throw error;
			}
		}
	}
}

export default support;
