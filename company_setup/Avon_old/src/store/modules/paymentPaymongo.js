import { DB, COLLECTION } from '@/config/firebaseInit';
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
                let tokenDetails = await GenerateToken({
                    payment: payload.payment,
                    userDetails: payload.userDetails
                });

                let paymentDetails = await CreatePayment({
                    tokenDetails: tokenDetails,
                    payment: payload.payment,
                    stockOrderReference: payload.stockOrderReference
                })
                console.log(paymentDetails);

                if (paymentDetails.data.data.attributes.status === "paid") {
                    //delete card details
                    if (payload.payment.hasOwnProperty('cardDetails')) {
                        delete payload.payment.cardDetails;
                    }
                    payload.payment.paymentStatus = 'Paid';
                    payload.payment.transactionNumber = paymentDetails.data.data.id;
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
