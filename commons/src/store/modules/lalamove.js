import { DB, COLLECTION, FIRESTORE } from '@/config/firebaseInit';
import axios from 'axios';

import cryptoJS from 'crypto-js';
import uuid from 'uuid';

const host = process.env.lalamoveURL;

async function generateSigniture(time, path, body, method) {
    let secret = await DB.collection('providers').doc('lalamove').collection('keys').doc('secret').get();
    secret = secret.data().key;

    let _encryptedStr = `${time}\r\n${method}\r\n${path}\r\n\r\n`
    
    if(method === 'PUT') {
        return cryptoJS.HmacSHA256(_encryptedStr, secret);
    }
    
    if (method !== 'GET') {
      let _body = JSON.stringify(body)
      _encryptedStr = _encryptedStr + _body
    }

    return cryptoJS.HmacSHA256(_encryptedStr, secret);
}

async function generateHeader(method, path, body) {
    let key = await DB.collection('providers').doc('lalamove').collection('keys').doc('public').get();
    key = key.data().key;
    
    let time = new Date().getTime().toString();
    return {
        'X-Request-ID': uuid.v4(),
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': 'hmac ' + key + ':' + time + ':' + await generateSigniture(time, path, body, method),
        'Accept': 'application/json',
        'X-LLM-Country': 'PH'
    }
}

const lalamove = {
    namespaced: true,
    state: {
        quotationBody: {},
    },
    getters: {
        GET_QUOTATION_BODY: state => state.quotationBody,
    },
    mutations: {
        SET_QUOTATION_BODY(state, payload) {
            state.quotationBody = payload;
        },
    },
    actions: {
        attachQuotationBody({state}, payload) {
            let stockOrder = Object.assign({}, payload);
            stockOrder.quotationBody = Object.assign({}, state.quotationBody);
            return stockOrder;
        },

        async getQuotation({state, commit, rootGetters}, payload) {
            commit('SET_QUOTATION_BODY', {});
            
            const pickUpAdd = await DB.collection('companyDetails').doc('address').get();
            let companyAdd = pickUpAdd.data().deliveryPickUp;
            let companyAddMod = companyAdd.replace(/ /g, "+");
            let response = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${companyAddMod}&key=AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk`
            });

            let originCoordinates = {
                lat: response.data.results[0].geometry.location.lat,
                lon: response.data.results[0].geometry.location.lng
            }

            console.log("COMPANY ADDRESS ", originCoordinates);

            const address = payload.toAddress;
            let resellerAdd = `${address.streetName}, ${address.barangay}, ${address.citymun}, ${address.province}, ${address.zipCode}`;
            let resellerAddMod = resellerAdd.replace(/ /g, "+");

            let res = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${resellerAddMod}&key=AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk`
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

            //Determine user payment preference and add it to lalamove quotations
            let specialRequest = [];
            if(payload.paymentType === 'COD') {
                specialRequest.push('COD');
            }

            console.log(payload);

            const user = rootGetters["accounts/user"];

            const currentTime = new Date();
            const tomorrow = `${currentTime.getMonth() + 1}/${currentTime.getDate() + 2}/${currentTime.getFullYear()} 13:00:00`; 

            let companyNum = await DB.collection('companyDetails').doc('contact').get();
            companyNum = companyNum.data().mobileNum;

            const body = {
                'scheduleAt': new Date(tomorrow).toISOString(),
                'serviceType': serviceType,
                'specialRequests': specialRequest,
                'requesterContact': {
                    'name': process.env.companyName,
                    'phone': companyNum
                },
                'stops': [
                    {
                        'location': { 
                            'lat': originCoordinates.lat.toString(), 
                            'lng': originCoordinates.lon.toString()
                        },
                        'addresses': {
                            'en_PH': {
                                'displayString': companyAdd,
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
                            'name': `${user.firstName} ${user.lastName}`,
                            'phone': user.contact
                        },
                        'remarks': `STOCK ORDER: ${payload.stockOrder.stockOrderReference}`
                    }
                ]
            };

            try {
                let response = await axios({
                    method: 'post',
                    url: `${host}/v2/quotations`,
                    headers: await generateHeader('POST', '/v2/quotations', body),
                    data: body,
                });
                console.log("LALAMOVE QUOTATION RESPONSE: ", response);
                response = response.data;

                body.quotedTotalFee = {
                    'amount': response.totalFee,
                    'currency': response.totalFeeCurrency
                };
                body.sms = true;

                commit('SET_QUOTATION_BODY', body);
                return response;
            }
            catch(error) {
                console.log("LALAMOVE QUOTATION RESPONSE ERROR: ", error.response);
                throw error;
            }
        },

        async getOrderStatus({state, commit, dispatch}, payload) {
           
            let URL = `${host}/v2/orders/${payload.orderRef}`;

            try {
                let response = await axios({
                    method: 'get',
                    url: URL,
                    headers: await generateHeader('GET', `/v2/orders/${payload.orderRef}`, null),
                });
                console.log('LALAMOVE GET ORDER STATUS:', response.data);
                
                if(response.data.status === 'CANCELED') {
                    response.data.status = 'CANCELLED';
                }

                return response.data;
            }
            catch(error) {
                console.log('LALAMOVE GET ORDER STATUS ERROR', error);
                throw error;
            }
        },
    }
}

export default lalamove;