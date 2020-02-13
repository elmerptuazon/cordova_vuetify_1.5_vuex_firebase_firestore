import { DB, COLLECTION, FIRESTORE } from '@/config/firebaseInit';
import axios from 'axios';
import router from '@/router';

import cryptoJS from 'crypto-js';
import uuid from 'uuid';

const host = process.env.lalamoveURL;

async function generateSigniture(time, path, body, method) {
    const secret = await DB.collection('providers').doc('lalamove').collection('keys').doc('secret').get();
    let _encryptedStr = `${time}\r\n${method}\r\n${path}\r\n\r\n`
    if (method !== 'GET') {
      let _body = JSON.stringify(body)
      _encryptedStr = _encryptedStr + _body
    }
    return cryptoJS.HmacSHA256(_encryptedStr, secret.data().key)
}

async function generateHeader(method, path, body) {
    const key = await DB.collection('providers').doc('lalamove').collection('keys').doc('public').get();
    let time = new Date().getTime().toString();
    return {
        'X-Request-ID': uuid.v4(),
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': 'hmac ' + key.data().key + ':' + time + ':' + await generateSigniture(time, path, body, method),
        'Accept': 'application/json',
        'X-LLM-Country': 'PH'
    }
}

const lalamove = {
    namespaced: true,
    state: {

    },
    getters: {

    },
    mutations: {

    },
    actions: {
        async getQuotation({state, dispatch, rootGetters}, payload) {
            
            let companyAdd = process.env.companyAddress.replace(/ /g, "+");
            let response = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${companyAdd}&key=AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk`
            });

            let originCoordinates = {
                lat: response.data.results[0].geometry.location.lat,
                lon: response.data.results[0].geometry.location.lng
            }

            console.log("COMPANY ADDRESS ", originCoordinates);

            const address = payload.toAddress;
            let resellerAdd = `${address.streetName}, ${address.barangay}, ${address.citymun}, ${address.province}, ${address.zipCode}`;
            resellerAdd = resellerAdd.replace(/ /g, "+");

            let res = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${resellerAdd}&key=AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk`
            });
            
            let toAddress = {
                lat: res.data.results[0].geometry.location.lat,
                lon: res.data.results[0].geometry.location.lng,
            };

            console.log("RESELLER ADDRESS ", toAddress);

            //determine service type based on the items' weight
            let serviceType;
            payload.itemWeight = parseFloat(payload.itemWeight / 1000);
            if(payload.itemWeight <= 20.00) 
                serviceType = 'MOTORCYCLE';
            else if(payload.itemWeight > 20.00 && payload.itemWeight <= 300.00)
                serviceType = 'MPV';
            else 
                serviceType = 'VAN';

            let specialRequest = ["COD"];
            console.log(payload);
            // if(payload.stockOrder.paymentDetails.paymentType === 'COD')
            //     specialRequest.push("COD");

            const user = rootGetters["accounts/user"];

            const currentTime = new Date();
            const tomorrow = `${currentTime.getMonth() + 1}/${currentTime.getDate() + 1}/${currentTime.getFullYear()} 12:00:00`; 

            const body = {
                'scheduleAt': new Date(tomorrow).toISOString(),
                'serviceType': serviceType,
                'specialRequests': specialRequest,
                'requesterContact': {
                    'name': `${user.firstName} ${user.lastName}`,
                    'phone': user.contact
                },
                'stops': [
                    {
                        'location': { 
                            'lat': originCoordinates.lat.toString(), 
                            'lng': originCoordinates.lon.toString()
                        },
                        'addresses': {
                            'en_PH': {
                                'displayString': companyAdd.replace(/[+]/g, " "),
                                'country': 'PH'
                            }
                        }
                    },
                    {
                        'location': { 
                            'lat': toAddress.lat.toString(), 
                            'lng': toAddress.lon.toString()
                        },
                        'addresses': {
                            'en_PH': {
                                'displayString': address.house + ", " + resellerAdd,
                                'country': 'PH'
                            }
                        }
                    },
                ],
                'deliveries': [
                    {
                        'toStop': 1,
                        'toContact': {
                            'name': process.env.companyName,
                            'phone': process.env.contactNo
                        },
                        'remarks': `STOCK ORDER: ${payload.stockOrder.stockOrderReference}`
                    }
                ]
            };

            try {
                const response = await axios({
                    method: 'post',
                    url: `${host}/v2/quotations`,
                    headers: await generateHeader('POST', '/v2/quotations', body),
                    data: body,
                });
                console.log("LALAMOVE QUOTATION RESPONSE: ", response);
                return response.data;
            }
            catch(error) {
                console.log("LALAMOVE QUOTATION RESPONSE ERROR: ", error);
                throw 0.00;
            }
        }
    }
}

export default lalamove;