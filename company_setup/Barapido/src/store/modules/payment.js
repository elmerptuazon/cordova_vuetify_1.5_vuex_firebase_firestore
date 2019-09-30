// import { DB, AUTH, COLLECTION } from '@/config/firebaseInit';
// import moment from 'moment';

// function generateOrderNumber(resellerID) {
//     var refNumber = (BigInt(resellerID).toString(36) + "-" + BigInt(Date.now()).toString(36)).toUpperCase();
//     return refNumber;
// }

// function realImgDimension(src) {
//     return new Promise((resolve) => {
//         var i = new Image();
//         i.onload = function () {
//             resolve({
//                 width: this.width,
//                 height: this.height
//             });
//         }
//         i.src = src;
//     })
// }

const payment = {
    namespaced: true,
    state: {

    },
    getters: {

    },
    mutations: {

    },
    actions: {
        async PayOrder({ commit }, payload) {
            console.log(payload);
            try {
                if (payload.paymentType === "COD") {
                    if (payload.hasOwnProperty('cardDetails')) {
                        delete payload.cardDetails;
                    }
                    console.log(payload);
                    payload.paymentStatus = 'Pending';
                    return payload;
                }
                else {
                    //in here you validate the CC and do the payment in the api using axios, code below are the return if api payment is successful.
                    if (payload.hasOwnProperty('cardDetails')) {
                        delete payload.cardDetails;
                    }
                    payload.paymentStatus = 'Paid';
                    return payload;
                }
            } catch (error) {
                throw error;
            }
        }
    }
}

export default payment;
