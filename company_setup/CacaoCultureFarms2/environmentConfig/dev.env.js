var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyD81CLcl4T50SweMxMyCy_r-vvq-3h5cCg"',
  authDomain: '"cacaoculturefarms-dev.firebaseapp.com"',
  databaseURL: '"https://cacaoculturefarms-dev.firebaseio.com"',
  projectId: '"cacaoculturefarms-dev"',
  storageBucket: '"cacaoculturefarms-dev.appspot.com"',
  messagingSenderId: '"26371903278"',
  appId: '"1:26371903278:web:850ae7581232b3484bb4bf"',
  measurementId: '"G-XV2JER7LNT"',
  storageCode: '"CacaoCultureFarmsTestApp"',
  webAdminId: '"admin"',
  companyName: '"CacaoCultureFarmsTestApp"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#b81212"',
  environment: '"test"',
  callbackURL: '"https://us-central1-appselltestapp.cloudfunctions.net/callback"'
})
