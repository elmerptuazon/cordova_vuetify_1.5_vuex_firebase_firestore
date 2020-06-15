var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  projectId: '"my-natural-dev"',
  appId: '"1:943759044147:web:05877f812940998c837d46"',
  databaseURL: '"https://my-natural-dev.firebaseio.com"',
  storageBucket: '"my-natural-dev.appspot.com"',
  locationId: '"us-central"',
  apiKey: '"AIzaSyAfTZ44pssPxImQQ3IoHfUNZpWkEd8Zt48"',
  authDomain: '"my-natural-dev.firebaseapp.com"',
  messagingSenderId: '"943759044147"',
  storageCode: '"FritoKing"',
  webAdminId: '"admin"',
  companyName: '"Frito King"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#c11515"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback/checkPaymentStatus"'
})
