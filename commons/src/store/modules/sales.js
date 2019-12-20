import { COLLECTION, AUTH } from '@/config/firebaseInit';
import moment from 'moment';
const sales = {
	namespaced: true,
	state: {},
	mutations: {},
	actions: {
		async GET_TARGET_SALES ({}) {
			try {
				const user = AUTH.currentUser;
				const querySnapshot = await COLLECTION.sales.where('resellerId', '==', user.uid).get()
				const items = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.id = documentSnapshot.id;
					return data;
				});
				if (items.length < 1) {
					const target = {
						data: {
							week: {
								total_sales: 0,
								sales_items: 0,
								customers: 0
							},
							month: {
								total_sales: 0,
								sales_items: 0,
								customers: 0
							},
							quarter: {
								total_sales: 0,
								sales_items: 0,
								customers: 0
							}
						},
						resellerId: user.uid
					}
					const docRef = await COLLECTION.sales.add(target);
					target.id = docRef.id;
					items.push(target);
				}
				return items;
			} catch (error) {
				return error;
			}
		},
		async UPDATE_TARGET_SALES ({}, target) {
			try {
				await COLLECTION.sales.doc(target.id).update({data: target.data});
			} catch (error) {
				return error;
			}
		},
		async GET_TOTAL_CUSTOMERS ({}, payload) {
			try {
				const user = AUTH.currentUser;
				let querySnapshot;
				if (payload.selected === 'Week') {
					const timestampBefore = moment().subtract(2, 'months').format('x');
					const timestampNow = moment().format('x');
					querySnapshot = await COLLECTION.accounts
					.where('createdAt', '>=', +timestampBefore)
					.where('createdAt', '<=', +timestampNow)
					.where('resellerId', '==', user.uid)
					.get();
				} else if (payload.selected === 'Month') {
					const startTimestamp = moment().startOf('month').format('x');
					const endTimestamp = moment().endOf('month').format('x');
					querySnapshot = await COLLECTION.accounts
					.where('createdAt', '>=', +startTimestamp)
					.where('createdAt', '<=', +endTimestamp)
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
					querySnapshot = await COLLECTION.accounts
					.where('createdAt', '>=', +startTimestamp)
					.where('createdAt', '<=', +endTimestamp)
					.where('resellerId', '==', user.uid)
					.get();
				}

				const items = querySnapshot.docs.map((documentSnapshot) => {
					const data = documentSnapshot.data();
					data.orderNo = documentSnapshot.id;
					return data;
				});

				return items.length;
			} catch (error) {
				return error;
			}
		}
	}
}

export default sales;

