import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const config = {
	apiKey: "AIzaSyCeGcbnkddmwFtTKmNafcoXpUU1nE7Cr1I",
	authDomain: "ever-bilena.firebaseapp.com",
	databaseURL: "https://ever-bilena.firebaseio.com",
	projectId: "ever-bilena",
	storageBucket: "ever-bilena.appspot.com",
	messagingSenderId: "291939986733",
	appId: "1:291939986733:web:82beda3f7ba891db"
}

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()

export const STORAGE = firebase.storage();
export const AUTH = firebase.auth();
export const DB = firebase.firestore();
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
	conversations: DB.collection('conversations')
}

