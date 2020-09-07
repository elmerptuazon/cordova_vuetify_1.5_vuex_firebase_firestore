var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyAxxc_vzR7XpBMD3o8HP-d68o92ZrbFi7Q"',
  authDomain: '"mynatural-dev.firebaseapp.com"',
  databaseURL: '"https://mynatural-dev.firebaseio.com"',
  projectId: '"mynatural-dev"',
  storageBucket: '"mynatural-dev.appspot.com"',
  messagingSenderId: '"329294986135"',
  appId: '"1:329294986135:web:984cb506ca95f7c890a2d2"',
  measurementId: '"G-XV2JER7LNT"',
  storageCode: '"mynatural-dev"',
  webAdminId: '"admin"',
  companyName: '"My Natural"',
  contactNumber: '"09123456789"',
  version: '"0.6.20"',
  primaryColor: '"#01903F"',
  environment: '"test"',
  callbackURL: '"https://us-central1-mynatural-dev.cloudfunctions.net/callback"'
})
