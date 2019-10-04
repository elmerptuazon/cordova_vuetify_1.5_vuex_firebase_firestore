var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk"',
  authDomain: '"barapido-dev.firebaseapp.com"',
  databaseURL: '"https://barapido-dev.firebaseio.com"',
  projectId: '"barapido-dev"',
  storageBucket: '"barapido-dev.appspot.com"',
  messagingSenderId: '"313662518566"',
  appId: '"1:313662518566:web:c93134d584700bf6"',
  storageCode: '"barapido"',
  webAdminId: '"admin"',
  companyName: '"Barapido"',
  version: '"0.6.7"',
  primaryColor: '"#16A2AF"',
  environment: '"test"'
})
