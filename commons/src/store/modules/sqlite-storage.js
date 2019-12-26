import {AUTH} from '@/config/firebaseInit';

const sqlite_storage = {
	namespaced: true,
	state: {
		db: null
	},
	actions: {
		CHECK_CONTACTS_TABLE({state}) {
			return new Promise(function(resolve) {
				state.db = window.sqlitePlugin.openDatabase({name: 'appsell.db', location: 'default'});
				state.db.transaction(function(tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS contacts (uid, data)', function() {
						console.log('contacts table created');
						return resolve({
							success: true
						});
					}, function(err) {
						console.log(err.message);
						return resolve({
							success: false,
							error: err.message
						});
					});
				}, function(err) {
					return resolve({
						success: false,
						err: err.message
					})
				}, function() {
					console.log('contacts table checked');
				});
			});
		},
		SAVE_CONTACTS({state}, data) {
			return new Promise(function(resolve) {
				if (!state.db) {
					state.db = window.sqlitePlugin.openDatabase({name: 'appsell.db', location: 'default'});
				}

				const user = AUTH.currentUser;
				state.db.transaction(function(tx) {
					tx.executeSql('INSERT INTO contacts VALUES (?, ?)', [user.uid, data], function(tx, result) {
						console.log('insertId', result.insertId);
						console.log('rowsAffected', result.rowsAffected);
						return resolve({success: true});
					});
				}, function(err) {
					console.log('contacts saved error', err.message);
					return resolve({
						success: false,
						err: err.message
					})
				}, function() {
					console.log('contacts saved...');
				});
			});
		},
		UPDATE_CONTACTS({state}, data) {
			return new Promise(function(resolve) {
				if (!state.db) {
					state.db = window.sqlitePlugin.openDatabase({name: 'appsell.db', location: 'default'});
				}

				const user = AUTH.currentUser;
				state.db.transaction(function(tx) {
					tx.executeSql('UPDATE contacts SET data = ? WHERE uid = ?', [data, user.uid], function(tx, result) {
						console.log('insertId', result.insertId);
						return resolve({success: true});
					});
				}, function(err) {
					console.log('contacts updated error', err.message);
					return resolve({
						success: false,
						err: err.message
					})
				}, function() {
					console.log('contacts updated...');
				});
			});
		},
		FETCH_CONTACTS({state}) {
			return new Promise(function(resolve) {
				if (!state.db) {
					state.db = window.sqlitePlugin.openDatabase({name: 'appsell.db', location: 'default'});
				}

				const user = AUTH.currentUser;
				state.db.transaction(function(tx) {
					tx.executeSql(`SELECT * FROM contacts WHERE uid = ?`, [user.uid], function(tx, result) {
						console.log('contacts', result);
						if (result.rows.length > 0) {
							return resolve({
								success: true,
								data: result.rows.item(0).data
							});
						} else {
							return resolve({
								success: false
							});
						}			
					});
				}, function(err) {
					console.log('fetched contact error...', err.message);
					return resolve({
						success: false,
						err: err.message
					})
				}, function() {
					console.log('fetched contact...');
				});
			});
		}
	}
}

export default sqlite_storage;
