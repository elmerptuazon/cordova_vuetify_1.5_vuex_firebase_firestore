var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyDAxQ8dvBH2CQNkvoFuklqVRV76KaRyKJ0"',
  authDomain: '"appselltestapp.firebaseapp.com"',
  databaseURL: '"https://appselltestapp.firebaseio.com"',
  projectId: '"appselltestapp"',
  storageBucket: '"appselltestapp.appspot.com"',
  messagingSenderId: '"671506060709"',
  appId: '"1:671506060709:web:7bcc28481ba6b94d12044c"',
  measurementId: '"G-XV2JER7LNT"',
  storageCode: '"AppSellTestApp"',
  webAdminId: '"admin"',
  companyName: '"AppSellTestApp"',
  contactNumber: '"09123456789"',
  version: '"0.6.9"',
  primaryColor: '"#0E1E38"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback/checkPaymentStatus"'
})
