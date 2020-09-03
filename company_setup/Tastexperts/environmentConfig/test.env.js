var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"tasteexperts-dev"',
  appId: '"1:822212122770:web:6601c1ff572584f33eee4b"',
  databaseURL: '"https://tasteexperts-dev.firebaseio.com"',
  storageBucket: '"tasteexperts-dev.appspot.com"',
  apiKey: '"AIzaSyCInbdQsrw3fQZeCNdR7C36hmPqIqm7iIs"',
  authDomain: '"tasteexperts-dev.firebaseapp.com"',
  messagingSenderId: '"822212122770"',
  webAdminId: '"admin"',
  companyName: '"Tastexperts"',
  contactNumber: '"0917 527 4641"',
  version: '"0.6.10"',
  primaryColor: '"#794F15"',
  environment: '"test"',
  callbackURL: '"https://us-central1-tasteexperts-dev.cloudfunctions.net/callback/checkPaymentStatus"',
})
