var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyC70H3CWjp0k6aacytzqYLmCcrqaKZncCI"',
  authDomain: '"rrawdev.firebaseapp.com"',
  databaseURL: '"https://rrawdev.firebaseio.com"',
  projectId: '"rrawdev"',
  storageBucket: '"rrawdev.appspot.com"',
  messagingSenderId: '"26080521344"',
  appId: '"1:26080521344:web:ed686a294b090493368a65"',
  storageCode: '"Rraw"',
  webAdminId: '"admin"',
  companyName: '"Rraw"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#CCAFAF"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback"'
})
