import { DB } from '@/config/firebaseInit';

const providers = {
    namespaced: true,
    state: {
        paymentProvider: {},
        logisticsProvider: [],
        paymentProviderSubscriber: null,
        logisticsProviderSubscriber: null
    },
    getters: {

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

                            if (logisticProviderData.isActive) {
                                commit('AddLogisticProvider', logisticProviderData)
                            }
                            if (!logisticProviderData.isActive) {
                                commit('RemoveLogisticProvider', logisticProviderData)
                            }
                        }

                    });
                });


        },


    }
}

export default providers;
