import { DB, AUTH, COLLECTION } from '@/config/firebaseInit';
import moment from 'moment';

const calendar = {
	namespaced: true,
	state: {},
	mutations: {},
	actions: {
		async FETCH_ORDERS_BY_DATE ({}, payload) {
			try {
				const user = AUTH.currentUser;
				const querySnapshot = await COLLECTION.orders
				// .where('resellerId', '==', user.uid)
				.where('proposed_delivery_schedule.date', '==', payload.date)
				.where('delivery_schedule_status', '==', 'accepted')
				.get();

				const orders = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.orderNo = documentSnapshot.id;
					return data;
				});

				const eventDate = moment(payload.date, 'MM/DD/YYYY').format('YYYY-MM-DD');
				const eventQuerySnapshot = await COLLECTION.events
				.where('resellerId', '==', user.uid)
				.where('date', '==', eventDate)
				.get();

				const eventsCollection = eventQuerySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.id = documentSnapshot.id;
					return data;
				});

				return orders.concat(eventsCollection);
			} catch (error) {
				return error;
			}
		},
		async FETCH_ORDERS_BY_MONTH ({}, payload) {
			try {
				const user = AUTH.currentUser;
				const startTimestamp = moment(payload.date, 'YYYY-MM').startOf('month').format('x');
				const endTimestamp = moment(payload.date, 'YYYY-MM').endOf('month').format('x');
				
				const querySnapshot = await COLLECTION.orders
				// .where('resellerId', '==', user.uid)
				.where('proposed_delivery_schedule.timestamp', '>=', +startTimestamp)
				.where('proposed_delivery_schedule.timestamp', '<=', +endTimestamp)
				.where('delivery_schedule_status', '==', 'accepted')
				.get();

				const orders = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.orderNo = documentSnapshot.id;
					return data;
				});

				const eventQuerySnapshot = await COLLECTION.events
				.where('resellerId', '==', user.uid)
				.where('timestamp', '>=', +startTimestamp)
				.where('timestamp', '<=', +endTimestamp)
				.get();

				const eventsCollection = eventQuerySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.id = documentSnapshot.id;
					return data;
				});

				return orders.concat(eventsCollection);
			} catch (error) {
				return error;
			}
		},
		async SAVE_NOTE ({}, payload) {
			try {
				const user = AUTH.currentUser;
				const data = {
					timestamp: +moment(payload.date, 'YYYY-MM-DD').format('x'),
					date: payload.date,
					time: payload.time,
					text: payload.text,
					resellerId: user.uid
				}
				const docRef = await COLLECTION.events.add(data);
				return {
					id: docRef.id,
					timestamp: data.timestamp
				}
			} catch (error) {
				return error;
			}
		},
		async UPDATE_NOTE ({}, payload) {
			try {
				const data = {
					time: payload.time,
					text: payload.text
				}
				await COLLECTION.events.doc(payload.id).update(data);
			} catch (error) {
				return error;
			}
		},
		async DELETE_NOTE ({}, id) {
			try {
				await COLLECTION.events.doc(id).delete();
			} catch (error) {
				return error;
			}
		}
	}
}

export default calendar;

