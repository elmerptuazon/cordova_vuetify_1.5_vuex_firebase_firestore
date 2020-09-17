var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  projectId: '"appsellfranchise"',
  appId: '"1:1069219513340:web:640e8dbeaebfecf8ee2879"',
  databaseURL: '"https://appsellfranchise.firebaseio.com"',
  storageBucket: '"appsellfranchise.appspot.com"',
  apiKey: '"AIzaSyBp7LvQJL0PjA1mtrDGk7SvN_OUAK9RJqQ"',
  authDomain: '"appsellfranchise.firebaseapp.com"',
  messagingSenderId: '"1069219513340"',
  storageCode: '"AppSellFranchise"',
  webAdminId: '"admin"',
  companyName: '"AppSell Demo App"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#d66807"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appsellfranchise.cloudfunctions.net/callback/checkPaymentStatus"',
})
