import { DB, COLLECTION, FIRESTORE } from '@/config/firebaseInit';
import axios from 'axios';
import router from '@/router';

import cryptoJS from 'crypto-js';
import uuid from 'uuid';

const host = process.env.lalamoveURL;

async function generateSigniture(time, path, body, method) {
    const secret = await DB.collection('providers').doc('lalamove').collection('keys').doc('secret').get();
    let _encryptedStr = `${time.toString()}\r\n${method}\r\n${path}\r\n\r\n`
    if (method !== 'GET') {
      let _body = JSON.stringify(body)
      _encryptedStr = _encryptedStr + _body
    }
    return cryptoJS.HmacSHA256(_encryptedStr, secret)
}

async function generateHeader(method, path, body) {
    const key = await DB.collection('providers').doc('lalamove').collection('keys').doc('public').get();
    let time = new Date().getTime();
    return {
        'X-Request-ID': uuid.v4(),
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': 'hmac ' + key + ':' + time + ':' + await generateSigniture(time, path, body, method),
        'Accept': 'application/json',
        'X-LLM-Country': 'PH'
    }
}

const delivery = {
    namespaced: true,
    state: {

    },
    getters: {

    },
    mutations: {

    },
    actions: {
        async getQuotation(payload) {
            const user = this.$store.getters["accounts/user"];
            
            let add = process.env.companyAddress;
            let companyAdd = `${add.streetName},${add.barangay},${add.citymun},${province}`;
            let origin = await axios({
                method: 'get',
                url: `https://us1.locationiq.com/v1/search.php?key=a3c4a27474960c&q="${companyAdd},PH"&format=json`
            });

            let originCoordinates = {
                lat: origin.data[0].lat,
                lon: origin.data[0].lon
            }

            console.log(originCoordinates);

            let address = await axios({
                method: 'get',
                url: `https://us1.locationiq.com/v1/search.php?key=a3c4a27474960c&q="${user.streetName},${user.barangay},${user.citymun},${user.province},${user.zipCode},PH"&format=json`
            });
            
            let toAddress = {
                lat: address.data[0].lat,
                lon: address.data[0].lon,
            };

            console.log(toAddress);

            //determine service type based on the items' weight
            let serviceType;
            if(payload.itemWeight <= 20.00) 
                serviceType = 'MOTORCYCLE';
            else if(payload.itemWeight > 20.00 && payload.itemWeight <= 300.00)
                serviceType = 'MPV';
            else 
                serviceType = 'VAN';

            const body = {
                'scheduleAt': new Date().toISOString(),
                'serviceType': serviceType,
                'specialRequest': ['COD'],
                'requesterContact': {
                    'name': `${user.firstName} ${user.lastName}`,
                    'phone': user.contact
                },
                'stops': [
                    {
                        'location': { 'lat': originCoordinates.lat, 'lon': originCoordinates.lon},
                        'address': {
                            'en_PH': {
                                'displayString': `${add.house}, ${companyAdd.split(',')}, PH`,
                                'country': 'PH'
                            }
                        }
                    },
                    {
                        'location': { 'lat': toAddress.lat, 'lon': toAddress.lon},
                        'address': {
                            'en_PH': {
                                'displayString': `${payload.streetName}, ${payload.barangay}, ${payload.citymun}, ${payload.province}, ${payload.zipCode}, PH`,
                                'country': 'PH'
                            }
                        }
                    },
                ],
                'deliveries': {
                    'toStop': 1,
                    'toContact': {
                        'name': 'Barapido',
                        'phone': '+639653202725'
                    },
                    'remarks': 'STOCK ORDER'
                }
            };

            try {
                const response = await axios({
                    method: 'post',
                    url: `${host}/v2/quotations`,
                    headers: await generateHeader('POST', '/v2/quotations', body),
                    data: body,
                });
                console.log(response.data);
                return response.data;
            }
            catch(error) {
                console.log(error);
                throw error;
            }
        }
    }
}

export default delivery;