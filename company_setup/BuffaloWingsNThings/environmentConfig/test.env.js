var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"fritoking-dev"',
  appId: '"1:200493591511:web:086dcbfe7f53d720aef992"',
  databaseURL: '"https://fritoking-dev.firebaseio.com"',
  storageBucket: '"fritoking-dev.appspot.com"',
  apiKey: '"AIzaSyAKjz6J06tTgQHM4kqnTod45eOkXR9_NOQ"',
  authDomain: '"fritoking-dev.firebaseapp.com"',
  messagingSenderId: '"200493591511"',
  storageCode: '"BuffaloWingsNThings"',
  webAdminId: '"admin"',
  companyName: '"Buffalo\'s Wings N Things"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#003784"',
  environment: '"test"',
  callbackURL: '"https://us-central1-fritoking-dev.cloudfunctions.net/callback/checkPaymentStatus"',
})
