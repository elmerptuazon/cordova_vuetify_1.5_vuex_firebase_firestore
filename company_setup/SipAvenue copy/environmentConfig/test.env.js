var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"buffalowings-dev"',
  appId: '"1:536526629541:web:333e1792ce8f83d530fb4c"',
  databaseURL: '"https://buffalowings-dev.firebaseio.com"',
  storageBucket: '"buffalowings-dev.appspot.com"',
  apiKey: '"AIzaSyAeoTQG_rtVx1sSPLBd5FDvNcO1q3gSKpo"',
  authDomain: '"buffalowings-dev.firebaseapp.com"',
  messagingSenderId: '"536526629541"',
  storageCode: '"BuffaloWingsNThings"',
  webAdminId: '"admin"',
  companyName: '"Buffalo\'s Wings N Things"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#0099ff"',
  environment: '"test"',
  callbackURL: '"https://us-central1-buffalowings-dev.cloudfunctions.net/callback/checkPaymentStatus"',
})
