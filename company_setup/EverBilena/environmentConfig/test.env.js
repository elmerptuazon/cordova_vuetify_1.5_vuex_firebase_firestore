var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyCSx6lIrUmXflCVFe6DKktZwXuXvbfZtJk"',
  authDomain: '"ever-bilena-dev.firebaseapp.com"',
  databaseURL: '"https://ever-bilena-dev.firebaseio.com"',
  projectId: '"ever-bilena-dev"',
  storageBucket: '"ever-bilena-dev.appspot.com"',
  messagingSenderId: '"127418362624"',
  appId: '"1:127418362624:web:fe8dafbb3c63c6d9"',
  storageCode: '"ever-bilena"',
  webAdminId: '"admin"',
  companyName: '"Ever Bilena"',
  version: '"0.6.5"',
  primaryColor: '"##D80072"',
})
