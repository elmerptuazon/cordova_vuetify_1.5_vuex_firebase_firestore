import { DB, COLLECTION } from '@/config/firebaseInit';
import axios from 'axios';



async function GenerateToken(payload) {
    try {
        let keysRef = await DB.collection('keys').doc('payment').collection('magpie').doc('public').get();
        const res = await axios({
            method: 'post',
            url: 'https://api.magpie.im/v1.1/tokens',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                "card": {
                    "name": payload.userDetails.name,
                    "number": parseInt(payload.payment.cardDetails.cardNumber.replace(/\s/g, "")).toString(),
                    "exp_month": parseInt(payload.payment.cardDetails.expiry.split("/")[0]),
                    "exp_year": parseInt(payload.payment.cardDetails.expiry.split("/")[1]),
                    "cvc": payload.payment.cardDetails.CVC
                }
            },
            auth: {
                username: keysRef.data().key,
                password: ''
            }

        });
        return res.data.id;
    }
    catch (e) {
        throw e;
    }
}

async function CreatePayment(payload) {
    try {
        // need to set up this and include in the data
        //"gateway": "magpie_3ds",
        //"redirect_url": "https://logistikusapi.firebaseapp.com/api/v1/",
        //"callback_url": "https://app.com/webhook/callback/${id}"
        let keysRef = await DB.collection('keys').doc('payment').collection('magpie').doc('secret').get();
        const res = await axios({
            method: 'post',
            url: 'https://api.magpie.im/v1.1/charges',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                "amount": Number(Number(payload.payment.amount).toFixed(2).replace(".", "")),
                "currency": "php",
                "description": `Customer Payment for ${payload.stockOrderReference}`,
                "statement_descriptor": `STCKO ${payload.stockOrderReference}`,
                "source": payload.tokenDetails,
                "capture": true,
            },
            auth: {
                username: keysRef.data().key,
                password: ''
            },

        });

        return res;
    }
    catch (e) {
        throw e;
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

                //in here you validate the CC and do the payment in the api using axios, code below are the return if api payment is successful.
                console.log("Generating Token");
                let tokenDetails = await GenerateToken({
                    payment: payload.payment,
                    userDetails: payload.userDetails
                });
                console.log("Creating Payment");
                let paymentDetails = await CreatePayment({
                    tokenDetails: tokenDetails,
                    payment: payload.payment,
                    stockOrderReference: payload.stockOrderReference
                })
                console.log(paymentDetails);

                if (paymentDetails.data.status === "succeeded") {
                    //delete card details
                    if (payload.payment.hasOwnProperty('cardDetails')) {
                        delete payload.payment.cardDetails;
                    }
                    payload.payment.paymentStatus = 'Paid';
                    payload.payment.transactionNumber = paymentDetails.data.id;
                }
                else {
                    //throw error
                    //check what kind of error so we can update the code
                    const error = new Error("payment not successful");
                    error.code = "others"
                    throw error;

                }

                return payload.payment;
                //}
            } catch (error) {
                throw error.response.data;
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
