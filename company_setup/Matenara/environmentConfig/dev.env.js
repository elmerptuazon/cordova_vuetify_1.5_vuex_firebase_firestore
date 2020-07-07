var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  projectId: '"matenara-dev"',
  appId: '"1:127991740211:web:6a871c4a18b71e4515b046"',
  databaseURL: '"https://matenara-dev.firebaseio.com"',
  storageBucket: '"matenara-dev.appspot.com"',
  apiKey: '"AIzaSyDBakbW6inOUZAORsH6HQZBvbPKcmdmH3k"',
  authDomain: '"matenara-dev.firebaseapp.com"',
  messagingSenderId: '"127991740211"',
  measurementId: '"G-XV2JER7LNT"',
  storageCode: '"AppSellTestApp"',
  webAdminId: '"admin"',
  companyName: '"AppSellTestApp"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#215e3f"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback"'
})
