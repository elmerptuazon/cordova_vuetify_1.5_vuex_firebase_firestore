const fs = require('fs-extra');
//const path = require('path');
//const Confirm = require('prompt-confirm');
const prompts = require('prompts');

//clean files
// (async function cleanUp() {
//     await fs.remove('res/icon');
//     await fs.remove('res/screen');
// })();


//check what company is Executed
// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });
// console.log();
//update the sources depending on the company

async function copyCompanySetUp() {

    const answer = await prompts({
        type: 'select',
        name: 'value',
        message: 'Pick a company to SetUp',
        choices: [
            { title: 'Ever Bilena', value: 'EverBilena' },
            { title: 'Barapido', value: 'Barapido', disabled: true },
            { title: 'Mary Kay', value: 'MaryKay', disabled: true },
            { title: 'My Natural', value: 'MyNatural', disabled: true }
        ],
        initial: 0
    }
    );
    let imgSource = `company_setup/${answer.value}/src/assets/img`;
    let imgDestination = 'src/assets/img'
    fs.copy(imgSource, imgDestination)
        .then(() => console.log('img update success!'))
        .catch(err => console.error(err))

    let resSource = `company_setup/${answer.value}/res`;
    let resDestination = 'res'

    fs.copy(resSource, resDestination)
        .then(() => console.log('res update success!'))
        .catch(err => console.error(err))

    let configSource = `company_setup/${answer.value}/environmentConfig`;
    let configDestination = 'config'

    fs.copy(configSource, configDestination)
        .then(() => console.log('config update success!'))
        .catch(err => console.error(err))

    return true;
};

module.exports.copyCompanySetUp = copyCompanySetUp;