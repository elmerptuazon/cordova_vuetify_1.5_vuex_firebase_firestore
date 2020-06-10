var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyA1p43Hys8LeHoqINSFOItJDEHLmggy4C4"',
  authDomain: '"potatocornerdev.firebaseapp.com"',
  databaseURL: '"https://potatocornerdev.firebaseio.com"',
  projectId: '"potatocornerdev"',
  storageBucket: '"potatocornerdev.appspot.com"',
  messagingSenderId: '"846971526982"',
  appId: '"1:846971526982:web:027bf465e5be6cc53e8f47"',
  storageCode: '"PotatoCorner"',
  webAdminId: '"admin"',
  companyName: '"Pick Up Sticks"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#f78e20"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback/checkPaymentStatus"'
})
