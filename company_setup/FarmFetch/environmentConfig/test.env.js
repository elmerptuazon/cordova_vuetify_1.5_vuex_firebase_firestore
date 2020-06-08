var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyDYoaR6mB5exEIkO2_1BJKoMuhUiSo2mnY"',
  authDomain: '"farmfetchdev-7031c.firebaseapp.com"',
  databaseURL: '"https://farmfetchdev-7031c.firebaseio.com"',
  projectId: '"farmfetchdev-7031c"',
  storageBucket: '"farmfetchdev-7031c.appspot.com"',
  messagingSenderId: '"455899115382"',
  appId: '"1:455899115382:web:512d68156916c929491457"',
  storageCode: '"FarmFetchDev"',
  webAdminId: '"admin"',
  companyName: '"Farm Fetch"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#f2d5bb"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback/checkPaymentStatus"'
})
