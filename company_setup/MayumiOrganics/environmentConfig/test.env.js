var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyD9nMyUgfTjIlBQ18m1CE10HRRJUhaUDn8"',
  authDomain: "mayumiorganics-dev.firebaseapp.com",
  databaseURL: '"https://mayumiorganics-dev.firebaseio.com"',
  projectId: '"mayumiorganics-dev"',
  storageBucket: '"mayumiorganics-dev.appspot.com"',
  messagingSenderId: '"375705893486"',
  appId: '"1:375705893486:web:3487859c75bc80de13847f"',
  measurementId: '"G-XV2JER7LNT"',
  storageCode: '"mayumiorganics"',
  webAdminId: '"admin"',
  companyName: '"Mayumi Organics"',
  contactNumber: '"09123456789"',
  version: '"0.6.10"',
  primaryColor: '"#0d3632"',
  environment: '"test"',
  callbackURL: '"https://us-central1-mayumiorganics.cloudfunctions.net/callback"'
})
