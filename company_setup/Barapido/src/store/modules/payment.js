import { DB, COLLECTION, FIRESTORE } from '@/config/firebaseInit';
import axios from 'axios';

async function GenerateToken(payload) {
    try {
        let keys = await COLLECTION.keys.doc(process.env.environment).get();
        
        let expMonth = parseInt(payload.payment.cardDetails.expiry.split("/")[0]);
        let expYr = parseInt(payload.payment.cardDetails.expiry.split("/")[1]);
        if(expYr < 100) expYr += 2000;
        
        const res = await axios({
            method: 'post',
            url: 'https://api.paymongo.com/v1/tokens',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                "data": {
                    "attributes": {
                        "number": parseInt(payload.payment.cardDetails.cardNumber.replace(/\s/g, "")).toString(),
                        "exp_month": expMonth,
                        "exp_year": expYr,
                        "cvc": payload.payment.cardDetails.CVC,
                        "billing": {
                            "name": payload.userDetails.name,
                            "email": payload.userDetails.email,
                            "phone": payload.userDetails.phone
                        }
                    }
                }
            },
            auth: {
                username: keys.data().public,
                password: ''
            },

        });

        return res.data.data.id;
    }
    catch (e) {
        throw e;
    }
}

async function CreatePayment(payload) {
    try {
        let keys = await COLLECTION.keys.doc(process.env.environment).get();
        const res = await axios({
            method: 'post',
            url: 'https://api.paymongo.com/v1/payments',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                "data": {
                    "attributes": {
                        "amount": Number(Number(payload.payment.amount).toFixed(2).replace(".", "")),
                        "currency": "PHP",
                        "description": `Customer Payment for ${payload.stockOrderReference}`,
                        "statement_descriptor": `BRP-STCKODR ${payload.stockOrderReference}`,
                        "source": {
                            "id": payload.tokenDetails,
                            "type": "token"
                        }
                    }
                }
            },
            auth: {
                username: keys.data().secret,
                password: ''
            },

        });

        return res;
    }
    catch (e) {
        throw e;
    }
}

async function CreatePaymentIntent(payload) {
    console.log('creating payment intent');

    try {
        const key = await DB.collection('providers').doc('paymongo')
                    .collection(process.env.environment).doc('keys').get();

        const response = await axios({
            method: 'post',
            url: 'https://api.paymongo.com/v1/payment_intents',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "data": {
                    "attributes": {
                        "amount": Number(Number(payload.payment.amount).toFixed(2).replace(".", "")),
                        "currency": "PHP",
                        "payment_method_allowed": ["card"],
                        "description": `Customer Payment for ${payload.stockOrderReference}`,
                        "statement_descriptor": `BRP-STCKODR ${payload.stockOrderReference}`,
                    }
                }
            },
            auth: {
                username: key.data().secret,
                password: ''
            }
        });
        
        console.log('payment intent created!');
        console.log('payment intent: ', response.data.data);
        return response.data.data;
    
    } catch(error) {
        console.log('Error: payment intent not created!: ', error);
        throw error;
    }
}

async function CreatePaymentMethod(payload) {
    let expMonth = parseInt(payload.payment.cardDetails.expiry.split("/")[0]);
    let expYr = parseInt(payload.payment.cardDetails.expiry.split("/")[1]);
    if(expYr < 100) expYr += 2000;
    
    try {
        console.log('creating payment method...');

        const key = await DB.collection('providers').doc('paymongo')
                    .collection(process.env.environment).doc('keys').get();

        const response = await axios({
            method: 'post',
            url: 'https://api.paymongo.com/v1/payment_methods',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "data": {
                    "attributes": {
                        "type": "card",
                        "details": {
                            "card_number": parseInt(payload.payment.cardDetails.cardNumber.replace(/\s/g, "")).toString(),
                            "exp_month": expMonth,
                            "exp_year": expYr,
                            "cvc": payload.payment.cardDetails.CVC,
                        },
                        "billing": {
                            "address": {
                                "line1": payload.userDetails.address.house,
                                "line2": payload.userDetails.address.street,
                                "city": payload.userDetails.address.citymun,
                                "state": payload.userDetails.address.province,
                                "postal_code": payload.userDetails.address.zipCode,
                                "country": "PH"    
                            },
                            "name": payload.userDetails.name,
                            "email": payload.userDetails.email,
                        },
                        "phone": payload.userDetails.phone
                    }
                }
            },
            auth: {
                username: key.data().public,
                password: ''
            }
        });

        console.log('payment method was created!');
        console.log('payment method: ', response.data.data);
        return response.data.data;
    
    } catch(error) {
        console.log('Error: payment method was not created!', error);
        throw error;
    }
}

async function attachToPaymentIntent(payload) {
    try {
        const paymentIntentId = payload.client_key.split('_client')[0];

        console.log('attaching payment intent to payment method');
        const key = await DB.collection('providers').doc('paymongo')
                    .collection(process.env.environment).doc('keys').get();

        const response = await axios({
            method: 'post',
            url: `https://api.paymongo.com/v1/payment_intents/${ paymentIntentId }/attach`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "data": {
                    "attributes": {
                        "payment_method": payload.paymentMethodId,
                        "client_key": payload.client_key,
                        // "return_url"7: 'https://appsell.ph/'
                    }
                }
            },
            auth: {
                username: key.data().public,
                password: ''
            }
        });

        console.log('attaching intent to method is finished!');
        console.log('attach intent: ', response.data.data);
        return response.data.data;
    
    } catch(error) {
        console.log("Error in attaching intent to method: ", error);
        throw error;
    }
}

async function GenerateEWalletSource(payload) {
    const paymentType = payload.payment.paymentType === 'GCash' ? 'gcash' : 'grab_pay';

    try {
        const key = await DB.collection('providers').doc('paymongo')
                    .collection(process.env.environment).doc('keys').get();

        const response = await axios({
            method: 'post',
            url: 'https://api.paymongo.com/v1/sources',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "data": {
                    "attributes": {
                        "type": paymentType,
                        "amount": Number(Number(payload.payment.amount).toFixed(2).replace(".", "")),
                        "currency": "PHP",
                        "redirect": {
                            "success": 'https://appsell.ph/paymentSuccess',
                            "failed": 'https://appsell.ph/paymentFail'
                        },
                        "billing": {
                            "name": payload.userDetails.name,
                            "email": payload.userDetails.email,
                            "phone": payload.userDetails.phone,
                            "address": {
                                "line1": payload.userDetails.address.house,
                                "line2": payload.userDetails.address.street,
                                "city": payload.userDetails.address.citymun,
                                "state": payload.userDetails.address.province,
                                "postal_code": payload.userDetails.address.zipCode,
                                "country": "PH"    
                            },
                        },
                    }
                }
            },
            auth: {
                username: key.data().secret,
                password: ''
            }
        });
        
        return response.data.data;

    } catch(error) {
        throw error;
    }
}

async function CreateEWalletPayment(payload) {
    try {
        const key = await DB.collection('providers').doc('paymongo')
                    .collection(process.env.environment).doc('keys').get();
        
        const response = await axios({
            method: 'post',
            url: 'https://api.paymongo.com/v1/payments',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "data": {
                    "attributes": {
                        "amount": Number(Number(payload.payment.amount).toFixed(2).replace(".", "")),
                        "currency": 'PHP',
                        "description": `Customer Payment for ${payload.stockOrder.stockOrderReference}`,
                        "statement_descriptor": `BRP-STCKODR ${payload.stockOrder.stockOrderReference}`,
                        "source": {
                            "id": payload.stockOrder.source_id,
                            "type": 'source'
                        }
                    }
                }
            },
            auth: {
                username: key.data().secret,
                password: ''
            }
        });

        return response.data.data;
        
    } catch(error) {
        throw error;
    }
}


const payment = {
    namespaced: true,
    state: {

    },
    getters: {

    },
    mutations: {

    },
    actions: {
        async PayOrderThruCreditCard({ commit }, payload) {
            try {
                //create ppayment intent
                let paymentIntent = await CreatePaymentIntent({
                    payment: payload.payment,
                    userDetails: payload.userDetails,
                    stockOrderReference: payload.stockOrder.stockOrderReference
                });

                let paymentMethod = await CreatePaymentMethod({
                    userDetails: payload.userDetails,
                    payment: payload.payment,
                });

                let attachResponse = await attachToPaymentIntent({
                    client_key: paymentIntent.attributes.client_key, 
                    paymentMethodId: paymentMethod.id
                });
                
                if (attachResponse.attributes.status === 'succeeded') {
                    //delete card details
                    if (payload.payment.hasOwnProperty('cardDetails')) {
                        delete payload.payment.cardDetails;
                    }
                    payload.payment.paymentStatus = 'succeeded';
                    payload.payment.transactionNumber = attachResponse.id;
                
                } else if(attachResponse.attributes.status === 'awaiting_next_action') {
                    //delete card details
                    if (payload.payment.hasOwnProperty('cardDetails')) {
                        delete payload.payment.cardDetails;
                    }
                    payload.payment.paymentStatus = 'awaiting_next_action';
                    payload.payment.checkout_url = attachResponse.attributes.next_action.redirect.url;
                    payload.payment.transactionNumber = attachResponse.id;
                    payload.payment.client_key = attachResponse.attributes.client_key;
                
                } else if(attachResponse.attributes.status === 'awaiting_payment_method'){
                    const error = new Error('an error occured');
                    error.response = attachResponse.attributes.last_payment_error;
                    throw error;
                }

                return payload.payment;
                
            } catch (error) {
                throw error.response.data;
            }
        },

        async CreateEWalletSource({ state, commit, dispatch }, payload) {
            try {

                const source = await GenerateEWalletSource(payload);

                await dispatch('stock_orders/UPDATE_STOCK_ORDER_DETAILS', {
                    id: payload.stockOrder.id,
                    updatedDetails: {
                        payment_type: source.attributes.type,
                        source_id: source.id,
                    }
                }, { root: true });

                return source;
            
            } catch(error) {
                console.log('pay thru e-wallet error: ', error);
                throw error;
            }
        },

        ListenToPaymentStatus({ state, commit }, payload) {
            const subscriber = DB.collection('stock_orders').doc(payload.stockOrderId)
                .onSnapshot((doc) => {
                    console.log('listen to payment status of source: ', payload.source_id);

                    let stockOrderDocument = doc.data();
                    stockOrderDocument.id = doc.id;

                    if(stockOrderDocument.status === 'chargeable') {
                        console.log('unsubscribing to status changes');
                        subscriber();

                        // await DB.collection('stock_orders').doc(payload.stockOrder.id).update({
                        //     payment_type: FIRESTORE.FieldValue.delete(),
                        //     source_id: FIRESTORE.FieldValue.delete(),
                        // });

                        return {
                            isSuccessful: true,
                        }
                    
                    } else {
                        subscriber();

                        // await DB.collection('stock_orders').doc(payload.stockOrder.id).update({
                        //     payment_type: FIRESTORE.FieldValue.delete(),
                        //     source_id: FIRESTORE.FieldValue.delete(),
                        // });
                    }
                });

        },

        async PayOrderThruEWallet({}, payload) {
            try {
                const paymentResult = await CreateEWalletPayment(payload);
                console.log('e-wallet payment obj: ', paymentResult);

                await DB.collection('stock_orders').doc(payload.stockOrder.id).update({
                    payment_type: FIRESTORE.FieldValue.delete(),
                    source_id: FIRESTORE.FieldValue.delete(),
                });

                payload.payment.transactionNumber = paymentResult.id;
                payload.payment.status = paymentResult.attributes.status;

                return payload.payment;
            
            } catch(error) {
                throw error;
            }
        },

        async checkPaymentStatus({ state, commit }, paymentIntent) {
            try {
                const key = await DB.collection('providers').doc('paymongo')
                            .collection(process.env.environment).doc('keys').get();

                const response = await axios({
                    method: 'get',
                    url: `https://api.paymongo.com/v1/payment_intents/${ paymentIntent.id }`,
                    params: {
                        client_key: paymentIntent.client_key
                    },
                    auth: {
                        username: key.data().public,
                        password: ''
                    }
                });

                return response.data.data;

            } catch(error) {
                console.log('check payment status error: ', error);
                throw error;
            }
        },

        async ProcessCODOrder({ commit }, payload) {

            if (payload.payment.hasOwnProperty('cardDetails')) {
                delete payload.payment.cardDetails;
            }

            payload.payment.paymentStatus = 'Pending';
            return payload.payment;

        }
    }
}

export default payment;
