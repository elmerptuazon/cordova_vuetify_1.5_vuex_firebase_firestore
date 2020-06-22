import { COLLECTION, AUTH, DB } from '@/config/firebaseInit';

const messages = {
	namespaced: true,
	state: {
		conversationSubscriber: null,
		messageSubscriber: null,
		conversationList: [],
		messagesList: []
	},
	getters: {
		GET_CONVERSATION_LIST: state => state.conversationList,
		GET_MESSAGES_LIST: state => state.messagesList,
		GET_NEW_MESSAGE_COUNT(state) {
			const userId = AUTH.currentUser.uid;
			return state.conversationList.filter((convo) => convo.opened[userId] === false).length;
		}
	},
	mutations: {
		
	},
	actions: {
		LISTEN_TO_CONVERSATIONS({ state, commit, getters, rootGetters, dispatch }, notificationSetting) {
			const uid = AUTH.currentUser.uid;

			console.log('listening to conversations');
			
			state.conversationList = [];
			
			state.conversationSubscriber = DB.collection('conversations')
			.where("users", "array-contains", uid)
			.orderBy('updated', 'desc')
			.onSnapshot((snapShot) => {
				
				snapShot.docChanges()
				.forEach(async (change) => {
					console.log('there is a change in conversations');

					let notif = {};
					if (change.type === "added") {
						let conversationData = change.doc.data();
						conversationData.id = change.doc.id;

						if (!conversationData.users.includes("admin")) {
							console.log("found user");
							const userIndex = conversationData.users.findIndex(user => user !== uid);
							conversationData.user = await dispatch(
								'accounts/GET_USER', 
								conversationData.users[userIndex], 
								{ root: true }
							);
						
						} else {
							console.log("found Admin");
							conversationData.user = Object.assign({}, {
								id: "admin",
								isAdmin: true
							});
						}


						state.conversationList.push(conversationData);

						//create notification if the user turned the new message setting on
						if (conversationData.opened[uid] === false && notificationSetting) {
							notif.title = 'New Message!';
							notif.text = `New Message has been received,\nClick this to open the app!`;
							notif.redirectURL = '/messages';
							dispatch('accounts/SEND_PUSH_NOTIFICATION', notif, { root: true });
						}
					}
					else if (change.type === "modified") {
						let conversationData = change.doc.data();
						conversationData.id = change.doc.id;

						const index = state.conversationList.findIndex((convo) => convo.id === conversationData.id);
						if(index !== -1) {
							state.conversationList[index].updatedAt = conversationData.updatedAt;
							state.conversationList[index].opened = conversationData.opened;
							
						}

						//create notification if the user turned the new message setting on
						if (conversationData.opened[uid] === false && notificationSetting) {
							notif.title = 'New Message!';
							notif.text = `New Message has been received,\nClick this to open the app!`;
							notif.redirectURL = '/messages';
							dispatch('accounts/SEND_PUSH_NOTIFICATION', notif, { root: true });
						}
					}
				})
			})
		},
		
		LISTEN_TO_MESSAGES({ state, commit, dispatch }, conversationId) {
			const uid = AUTH.currentUser.uid;
			console.log('Listening to new messages');
			state.messagesList = [];

			state.messageSubscriber = DB.collection('messages')
			.where('conversationId', '==', conversationId)
			.onSnapshot((snapshot) => {
				
				
				snapshot.docChanges()
				.forEach(async (change) => {
					console.log('new message arrived');
					const data = change.doc.data();
					data.id = change.doc.id;
					
					if (change.type === 'added') {
						if (data.sender === uid) {
							data.you = true;
						} else {
							data.you = false;
						}
						
						//if current messages list is empty, push the first message first
						if(!state.messagesList.length) {
							state.messagesList.push(data);
						
						} else {
							//avoid pusing the same message that the reseller sent to the reciepient in the message list 
							const lastIndex = state.messagesList.length - 1;
							const lastMessage = state.messagesList[lastIndex];
							
							if(lastMessage.id !== data.id) {
								state.messagesList.push(data);
							}
						}
					}
					
				});
				
			});

		},

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

		UNSUBSCRIBE_FROM_CONVERSATIONS({state}) {
			if(state.conversationSubscriber) {
				state.conversationSubscriber();
			}
			
			if(state.messageSubscriber) {
				state.messageSubscriber();		
			}
		}

	}
}

export default messages;
