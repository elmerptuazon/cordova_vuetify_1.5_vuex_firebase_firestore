var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
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
  version: '"0.6.11"',
  primaryColor: '"#16A2AF"',
  environment: '"test"',
  callbackURL: '"https://us-central1-barapido-dev.cloudfunctions.net/callback/checkPaymentStatus"',
  barapidoShippingURL: '"https://us-central1-barapido-dev.cloudfunctions.net/barapidoAPI/getQuotation"',
  lalamoveURL: '"https://sandbox-rest.lalamove.com"',
  companyAddress: "Inoza Tower, 40th Street, BGC, Taguig City, Metro Manila"
})
