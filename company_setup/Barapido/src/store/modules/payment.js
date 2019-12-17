import { DB, COLLECTION, FIRESTORE } from '@/config/firebaseInit';
import axios from 'axios';
import router from '@/router';


async function GenerateToken(payload) {
    try {
        let keysRef = await DB.collection('providers').doc('magpie').collection('keys').doc('public').get();
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

        let keysRef = await DB.collection('providers').doc('magpie').collection('keys').doc('secret').get();
        const res = await axios({
            method: 'post',
            url: 'https://api.magpie.im/v1.1/charges',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                "amount": Number(Number(payload.payment.amount).toFixed(2).replace(".", "")),
                "currency": "php",
                "description": `Customer Payment for ${payload.stockOrder.stockOrderReference}`,
                "statement_descriptor": `STCKO ${payload.stockOrder.stockOrderReference}`,
                "source": payload.tokenDetails,
                "capture": true,
                "gateway": "magpie_3ds",
                "redirect_url": `${process.env.callbackURL}/${payload.stockOrder.id}`,
                "callback_url": `${process.env.callbackURL}/${payload.stockOrder.id}`
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
        paymentOccured: null
    },
    getters: {

    },
    mutations: {

        SetPaymentOccured(state, payload) {
            state.paymentOccured = payload;
        },

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
                console.log(tokenDetails);
                console.log(payload.payment);
                console.log(payload.stockOrder);
                //You Just need to call the API, as the API will call a callback function from us
                //so you just need to return the value of the payment to get the URL of the 3DS
                console.log("Creating Payment");
                let paymentDetails = await CreatePayment({
                    tokenDetails: tokenDetails,
                    payment: payload.payment,
                    stockOrder: payload.stockOrder
                })
                console.log(paymentDetails);
                //for magpie they use Capatured
                // if (paymentDetails.data.captured) {
                //     //delete card details
                //     if (payload.payment.hasOwnProperty('cardDetails')) {
                //         delete payload.payment.cardDetails;
                //     }
                //     payload.payment.paymentStatus = 'Paid';
                //     payload.payment.transactionNumber = paymentDetails.data.id;
                // }
                // else {
                //     //throw error
                //     //check what kind of error so we can update the code
                //     const error = new Error("payment not successful");
                //     error.code = "others"
                //     throw error;

                // }
                return paymentDetails.data;
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

        },

        ListenToPaymentStatus({ state, dispatch, commit }, payload) {


            console.log(payload);
            let subscriber;
            subscriber = COLLECTION.stock_orders.doc(payload.id)
                .onSnapshot((doc) => {
                    console.log('Listening to Payment .....');
                    let stockOrderDocument = doc.data();
                    stockOrderDocument.id = doc.id;
                    console.log(stockOrderDocument);
                    if (stockOrderDocument.paymentDetails.paymentStatus.toLowerCase() === "paid") {
                        dispatch(
                            "stock_orders/SUBMIT_CALLBACK",
                            stockOrderDocument, { root: true }
                        ).then(
                            result => {
                                router.push({
                                    name: "StockOrderCheckoutSuccess",
                                    params: {
                                        stockOrder: stockOrderDocument,
                                        submittedAt: result.submittedAt
                                    }
                                });
                            }
                        );
                        subscriber();
                        commit('SetPaymentOccured', true);

                    } else {
                        //handle failed stockOrder 
                        subscriber();
                        //delete paymentObject
                        const stockOrderRef = COLLECTION.stock_orders.doc(payload.id);

                        // Remove the 'capital' field from the document
                        const removePaymentDetails = stockOrderRef.update({
                            paymentDetails: FIRESTORE.FieldValue.delete(),
                            logisticsDetails: FIRESTORE.FieldValue.delete()
                        });
                        console.log(`Payment Failed Removing Payment Details" ${removePaymentDetails}`);
                        commit('SetPaymentOccured', false);



                    }



                });
        },


    }
}

export default payment;
