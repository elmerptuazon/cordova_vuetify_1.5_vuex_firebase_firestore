import { DB } from '@/config/firebaseInit';
import axios from 'axios';

const providers = {
    namespaced: true,
    state: {
        paymentProvider: {},
        logisticsProvider: [],
        paymentProviderSubscriber: null,
        logisticsProviderSubscriber: null
    },
    getters: {
        GET_LOGISTICS_PROVIDER: state => state.logisticProvider,
    },
    mutations: {

        SetPaymentProvider(state, payload) {
            state.paymentProvider = payload;
        },
        SetlogisticsProvider(state, payload) {
            state.logisticsProvider = payload;
        },
        AddLogisticProvider(state, payload) {
            state.logisticsProvider.push(payload);
        },
        RemoveLogisticProvider(state, payload) {
            const filteredLogistics = state.logisticsProvider.filter(logistic => logistic.id != payload.id)
            state.logisticsProvider = filteredLogistics;
        },
        UnsubscribeToPaymentSubscriber(state) {
            console.log('Unsubscribing to Payment Provider')
            state.paymentProviderSubscriber();
        },
        UnsubscribeToLogisticsSubscriber(state) {
            console.log('Unsubscribing to Logistic Provider')
            state.logisticsProviderSubscriber();
        }
    },
    actions: {


        ListenToPaymentProvider({ state, commit }) {
            console.log("listening to payment providers....")
            state.paymentProviderSubscriber = DB.collection("providers").where("providerType", "==", "payment")
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        let paymentProviderData = change.doc.data();
                        paymentProviderData.id = change.doc.id;
                        if (change.type === "added") {
                            console.log("Payment Provider: ", paymentProviderData);
                            if (paymentProviderData.isActive) {
                                commit('SetPaymentProvider', paymentProviderData)
                            }
                        }
                        if (change.type === "modified") {
                            console.log("Modified paymentProvider: ", paymentProviderData);
                            if (paymentProviderData.isActive) {
                                commit('SetPaymentProvider', paymentProviderData)
                            }
                        }

                    });
                });


        },
        ListenToLogisticsProvider({ state, commit }) {
            console.log("listening to Logistics providers....")
            state.logisticsProviderSubscriber = DB.collection("providers").where("providerType", "==", "logistics")
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        let logisticProviderData = change.doc.data();
                        logisticProviderData.id = change.doc.id;
                        if (change.type === "added") {
                            console.log("Logistics: ", logisticProviderData);
                            if (logisticProviderData.isActive) {
                                commit('AddLogisticProvider', logisticProviderData)
                            }
                        }
                        if (change.type === "modified") {
                            console.log("Modified logistics Provider: ", logisticProviderData);
                            const logisticStateValue = state.logisticsProvider.find(logistic => logistic.id == logisticProviderData.id);

                            if (logisticStateValue === undefined) {
                                commit('AddLogisticProvider', logisticProviderData)
                            } else {
                                if (logisticProviderData.isActive && (logisticStateValue.isActive != logisticProviderData.isActive)) {
                                    commit('AddLogisticProvider', logisticProviderData)
                                }
                                if (!logisticProviderData.isActive) {
                                    commit('RemoveLogisticProvider', logisticProviderData)
                                }
                            }

                        }

                    });
                });


        },

        async CalculateShipping({ state }, payload) {


            for (const logistics of state.logisticsProvider) {
                if (logistics.id === 'barapido') {
                    //get key
                    //run http call for different url to get quotations per company
                    try {
                        const res = await axios({
                            method: 'get',
                            url: process.env.barapidoShippingURL,
                            params: {
                                province: payload.toAddress.province,
                                cityMun: payload.toAddress.citymun,
                                itemWeight: payload.itemWeight / 1000
                            }
                        });

                        logistics.shippingFee = res.data.deliveryFee;
                    
                    } catch(error) {
                        logistics.shippingFee = 'error';
                        error.logisticsID = logistics.id;
                        throw error;
                    }
                }
            }

        },

        async GetFreeDeliveryCutOff() {
            try {
                const response = await DB.collection('providers').doc('settings').get();
                return response.data();
            }
            catch(error) {
                console.log(error);
                throw error;
            }
        }


    }
}

export default providers;
