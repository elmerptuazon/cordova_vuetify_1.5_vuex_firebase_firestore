var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyD4xk-R2E7hkJGl3T820hkmUiMxVP0LPVE"',
  authDomain: '"kayumanggiorganic-dev.firebaseapp.com"',
  databaseURL: '"https://kayumanggiorganic-dev.firebaseio.com"',
  projectId: '"kayumanggiorganic-dev"',
  storageBucket: '"kayumanggiorganic-dev.appspot.com"',
  messagingSenderId: '"316844676986"',
  appId: '"1:316844676986:web:57c7a5a119b451aafc68c3"',
  measurementId: '"G-XV2JER7LNT"',
  storageCode: '"KayumanggiOrganic"',
  webAdminId: '"admin"',
  companyName: '"Kayumanggi Organic Test App"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#4bb6d7"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback"'
})
