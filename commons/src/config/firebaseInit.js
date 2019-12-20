import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const config = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	databaseURL: process.env.databaseURL,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId
}

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()

export const STORAGE = firebase.storage();
export const AUTH = firebase.auth();
export const DB = firebase.firestore();
export const FIRESTORE = firebase.firestore;
// DB.settings({
// 	timestampsInSnapshots: true
// });
// DB.enablePersistence();

export const COLLECTION = {
	accounts: DB.collection('accounts'),
	catalogues: DB.collection('catalogues'),
	products: DB.collection('products'),
	orders: DB.collection('orders'),
	inventory: DB.collection('inventory'),
	sales: DB.collection('sales'),
	events: DB.collection('events'),
	offline_contacts: DB.collection('offline_contacts'),
	stock_orders: DB.collection('stock_orders'),
	support: DB.collection('support'),
	conversations: DB.collection('conversations'),
	keys: DB.collection('keys'),
}

