const fs = require('fs-extra');
const Confirm = require('prompt-confirm');
const {
  exec
} = require('child_process');
const companySetup = require('./companySetup');

const srcpath = 'www/fonts/';
const dstpath = 'www/css/fonts';
const indexFile = 'www/index.html';


function executeCommand(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (err, stdout) {
      if (err) {
        reject(err);
        return;
      }

      resolve(stdout);
    });
  });
}

(async function fixDirectoriesAndFilesOfWWW() {
  try {
    console.log('Setting up the company')
    const value = await companySetup.copyCompanySetUp();
    //console.log(value);
    console.log('Building app. Please wait...');
    await executeCommand('npm run build');
    console.log('Build done.');
    const data = await fs.readFile(indexFile, 'utf8');
    const index = data.replace(/\/static/g, '');
    await fs.outputFile(indexFile, index);
    await fs.move(srcpath, dstpath);
    console.log('Directories and files of www fixed.');

    // const prompt = new Confirm('Generate apk file?');
    // const answer = await prompt.run();
    const answer = true;
    if (answer) {
      console.log('Building apk. Please wait...');
      await executeCommand('cordova build android');
      console.log('APK generated.');
      //await executeCommand(String.raw`start platforms\android\app\build\outputs\apk\debug`);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
