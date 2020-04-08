import { DB, COLLECTION } from '@/config/firebaseInit';
import axios from 'axios';
// import providers from './../../../../../src/store/modules/providers';

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
        const key = await DB.collection('providers').doc('paymongo').collection(process.env.environment).doc('keys').get();

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

        const key = await DB.collection('providers').doc('paymongo').collection(process.env.environment).doc('keys').get();

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

async function attachToPaymentIntent(clientKey, paymentMethodId) {
    try {
        const paymentIntentId = clientKey.split('_client')[0];

        console.log('attaching payment intent to payment method');
        const key = await DB.collection('providers').doc('paymongo').collection(process.env.environment).doc('keys').get();

        const response = await axios({
            method: 'post',
            url: `https://api.paymongo.com/v1/payment_intents/${ paymentIntentId }/attach`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "data": {
                    "attributes": {
                        "payment_method": paymentMethodId,
                        "client_key": clientKey
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
                    userDetails: payload.userDetails
                });

                let paymentMethod = await CreatePaymentMethod({
                    userDetails: payload.userDetails,
                    payment: payload.payment,
                    stockOrderReference: payload.stockOrderReference
                })

                let attachResponse = await attachToPaymentIntent(
                    paymentIntent.attributes.client_key, 
                    paymentMethod.id
                );

                if (attachResponse.attributes.status === 'succeeded') {
                    //delete card details
                    if (payload.payment.hasOwnProperty('cardDetails')) {
                        delete payload.payment.cardDetails;
                    }
                    payload.payment.paymentStatus = 'Paid';
                    payload.payment.transactionNumber = attachResponse.id;
                }
                else {
                    //throw error
                    //check what kind of error so we can update the code
                    const error = new Error("payment not successful");
                    error.code = "others"
                    throw error;

                }

                return payload.payment;
                
            } catch (error) {
                throw error.response.data;
            }
        },
        
        // async PayOrderThruCreditCard({ commit }, payload) {
        //     try {

        //         //in here you validate the CC and do the payment in the api using axios, code below are the return if api payment is successful.
        //         let tokenDetails = await GenerateToken({
        //             payment: payload.payment,
        //             userDetails: payload.userDetails
        //         });

        //         let paymentDetails = await CreatePayment({
        //             tokenDetails: tokenDetails,
        //             payment: payload.payment,
        //             stockOrderReference: payload.stockOrderReference
        //         })
        //         console.log(paymentDetails);

        //         if (paymentDetails.data.data.attributes.status === "paid") {
        //             //delete card details
        //             if (payload.payment.hasOwnProperty('cardDetails')) {
        //                 delete payload.payment.cardDetails;
        //             }
        //             payload.payment.paymentStatus = 'Paid';
        //             payload.payment.transactionNumber = paymentDetails.data.data.id;
        //         }
        //         else {
        //             //throw error
        //             //check what kind of error so we can update the code
        //             const error = new Error("payment not successful");
        //             error.code = "others"
        //             throw error;

        //         }

        //         return payload.payment;
        //         //}
        //     } catch (error) {
        //         throw error.response.data;
        //     }
        // },

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
