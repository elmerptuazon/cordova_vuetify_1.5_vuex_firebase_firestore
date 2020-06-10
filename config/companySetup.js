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
// console.log();Aquitek
//update the sources depending on the company

async function copyCompanySetUp() {

    const answer = await prompts({
        type: 'select',
        name: 'value',
        message: 'Pick a company to SetUp',
        choices: [
            { title: 'AppSellTestApp', value: 'AppSellTestApp' },            
            { title: 'Barapido', value: 'Barapido' },
            { title: 'Fetch', value: 'Fetch' },
            { title: 'Avon', value: 'Avon' },
            { title: 'Babae', value: 'Babae' },
            { title: 'Mother Nurture', value: 'MotherNurture' },
            { title: 'Potato Corner', value: 'PotatoCorner' },
            { title: 'Bente Silog', value: 'BenteSilog' },
            { title: 'Ever Bilena', value: 'EverBilena', disabled: true},
            { title: 'Mary Kay', value: 'MaryKay', disabled: true },
            { title: 'My Natural', value: 'MyNatural', disabled: true }
        ],
        initial: 0
    }
    );

    try {
        //remove old files
        fs.emptyDirSync('src');
        console.log('Deleted Files');

        //setup commons folder
        let commonSource = 'commons/src';
        let commonDestination = 'src'
        await fs.copy(commonSource, commonDestination)
        console.log('Common Files has been Set');

        let imgSource = `company_setup/${answer.value}/src/assets/img`;
        let imgDestination = 'src/assets/img'
        await fs.copy(imgSource, imgDestination)
        console.log('Img assets update success!')

        let resSource = `company_setup/${answer.value}/res`;
        let resDestination = 'res'
        await fs.copy(resSource, resDestination)
        console.log('Res update success!')

        let configSource = `company_setup/${answer.value}/environmentConfig`;
        let configDestination = 'config'
        await fs.copy(configSource, configDestination)
        console.log('Environment Config update success!')

        let pageSource = `company_setup/${answer.value}/src/pages`;
        let pageDestination = 'src/pages'
        await fs.copy(pageSource, pageDestination)
        console.log('Pages update success!')

        let componentSource = `company_setup/${answer.value}/src/components`;
        let componentDestination = 'src/components'
        await fs.copy(componentSource, componentDestination)
        console.log('Components update success!')


        let moduleSource = `company_setup/${answer.value}/src/store`;
        let moduleDestination = 'src/store'
        await fs.copy(moduleSource, moduleDestination)
        console.log('Store Modules update success!')

        let configxmlSource = `company_setup/${answer.value}/configxml/config.xml`;
        let configxmlgDestination = 'config.xml'
        await fs.copy(configxmlSource, configxmlgDestination)
        console.log('config.xml update success!')


    }
    catch (err) {
        console.error(err)
    }





    return true;
};

module.exports.copyCompanySetUp = copyCompanySetUp;