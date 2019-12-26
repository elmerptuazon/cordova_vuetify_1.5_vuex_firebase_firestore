import { COLLECTION, AUTH, DB } from '@/config/firebaseInit';

const messages = {
	namespaced: true,
	state: {
	},
	getters: {
	},
	mutations: {
	},
	actions: {
		async GET_CONVERSATIONS({ rootState, dispatch }, payload) {
			try {
				const convoRef = COLLECTION.conversations;
				const userId = AUTH.currentUser.uid;

				const convoQuerySnapshot = await convoRef
					.where('users', 'array-contains', userId)
					.orderBy('updated', 'desc')
					.get();

				const conversations = convoQuerySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});


				for (const c of conversations) {

					if (!c.users.includes("admin")) {
						console.log("found user");
						const userIndex = c.users.findIndex(user => user !== userId);
						c.user = await dispatch('accounts/GET_USER', c.users[userIndex], { root: true });
					}
					else {
						console.log("found Admin");
						c.user = {
							id: "admin",
							isAdmin: true
						};
					}
				}

				return conversations;
			} catch (error) {
				throw error;
			}
		},
		async GET_MESSAGES({ rootState }, conversationId) {
			try {
				const messageRef = DB.collection('messages');
				const userId = rootState.auth.user.id;

				const querySnapshot = await messageRef
					.where('conversationId', '==', conversationId)
					.get();

				const messages = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});

				messages.forEach((m) => {
					if (m.sender === userId) {
						m.you = true;
					} else {
						m.you = false;
					}
				});

				return messages;
			} catch (error) {
				throw error;
			}
		},
		async ADD_CONVERSATION({ rootState }, payload) {
			const conversationsRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;
			const { recipientId, sendMessage } = payload;

			try {
				const d = Date.now();
				const response = await conversationsRef.add({
					created: d,
					opened: false,
					updated: d,
					users: [userId, recipientId]
				});

				return response;
			} catch (error) {
				throw error;
			}
		},
		async SEND_MESSAGE({ }, payload) {
			const messagesRef = DB.collection('messages');
			const conversationsRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;

			try {
				const obj = {
					conversationId: payload.conversationId,
					created: Date.now(),
					sender: userId
				}

				if (payload.attachment) {
					obj.attachment = true;
					obj.url = payload.url;
				} else {
					obj.text = payload.text;
				}

				const doc = await messagesRef.add(obj);

				const opened = {
					[userId]: true,
					[payload.recipientId]: false
				}

				await conversationsRef.doc(payload.conversationId).update({
					opened: opened,
					updated: Date.now()
				});

				return doc;
			} catch (error) {
				throw error;
			}
		},
		async CHECK_IF_EXISTS({ rootState, dispatch }, recipientId) {
			const convoRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;

			try {
				const convoQuerySnapshot = await convoRef
					.where('users', '==', [recipientId, userId])
					.get();

				const conversations = convoQuerySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});

				if (conversations.length > 0) {
					return conversations;
				} else {
					try {
						const convoQuerySnapshot2 = await convoRef
							.where('users', '==', [userId, recipientId])
							.get();

						const conversations2 = convoQuerySnapshot2.docs.map((doc) => {
							const data = doc.data();
							data.id = doc.id;
							return data;
						});

						return conversations2;
					} catch (error) {
						throw error;
					}
				}
			} catch (error) {
				throw error;
			}

		},
		async OPEN_UNREAD({ rootState }, id) {
			const conversationsRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;

			try {
				await conversationsRef.doc(id).update({ [`opened.${userId}`]: true });
			} catch (error) {
				throw error;
			}
		},
		LISTEN_TO_MESSAGES({ state, commit, dispatch }) {
			const uid = AUTH.currentUser.uid;
			console.log('Listening to new messages')

			COLLECTION.conversations.where("users", "array-contains", uid).onSnapshot((snapShot) => {

				snapShot.docChanges().forEach((change) => {
					let notif = {};
					if (change.type === "added") {
						let conversationData = change.doc.data();
						if (conversationData.opened[uid] === false) {
							notif.title = 'New Message!';
							notif.text = 'New Message has been received, open the app to see the message!';
							dispatch('accounts/SEND_PUSH_NOTIFICATION', notif, { root: true });
						}
					}
					else if (change.type === "modified") {
						let conversationData = change.doc.data();
						if (conversationData.opened[uid] === false) {
							notif.title = 'New Message!';
							notif.text = 'New Message has been received, open the app to see the message!';
							//console.log("disapatching push notif");
							dispatch('accounts/SEND_PUSH_NOTIFICATION', notif, { root: true });
						}
					}
				})

				//console.log('messages listener:');
				//console.log(title, text);



			});
		},

	}
}

export default messages;
