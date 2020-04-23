import { DB } from '@/config/firebaseInit';

function GenerateTrackingNumber() {
    var refNumber = `PHTN${BigInt(Date.now()).toString(36).toUpperCase()}`;
    return refNumber;
}

const shipment = {
    namespaced: true,
    state: {
        shipmentList: []
    },
    getters: {
        // GET_RECEIVABLE_SHIPMENT_COUNT(state) {
        //     return state.shipmentList.filter(shipment => shipment.status !== 'Received').length;
        // }
        GET_SHIPMENT_LIST: state => state.shipmentList,
    },
    mutations: {
        AddShipment(state, payload) {
            state.shipmentList.unshift(payload);
        },
        SetShipments(state, payload) {
            state.shipmentList = payload;
        },
        ClearShipmentList(state) {
            state.shipmentList = [];
        },
        UpdateShipment(state, payload) {
            let shipmentIndex = state.shipmentList.findIndex((shipment => shipment.trackingNumber == payload.trackingNumber));
            Object.keys(payload.update).forEach((key) => {
                state.shipmentList[shipmentIndex][key] = payload.update[key];
            });
            console.log(state.shipmentList);
        }
    },
    actions: {

        async GetShipments({ commit }, payload) {
            try {
                commit('ClearShipmentList');
                const shipmentSnapshot = await DB.collection('shipment').where("stockOrder.stockOrderId", "==", payload).orderBy("dateSubmitted", "desc").get();
                console.log(shipmentSnapshot)
                if (!shipmentSnapshot.empty) {
                    const shipmentList = shipmentSnapshot.docs.map((shipment) => {
                        const shipmentData = shipment.data();
                        shipmentData.id = shipment.id;
                        return shipmentData;
                    })
                    commit('SetShipments', shipmentList);
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }

        },
        async UpdateShipment({ commit, dispatch }, payload) {
            try {

                const response = await DB.collection('shipment').doc(payload.id).update(payload.update);

                commit('UpdateShipment', {
                    trackingNumber: payload.trackingNumber,
                    update: payload.update
                })
                if (payload.hasOwnProperty("stockOrderId")) {
                    await dispatch("stock_orders/UPDATE_STOCK_ORDER", {
                        id: payload.stockOrderId,
                        key: "shipmentsToReceive",
                        value: payload.stockOrderUpdate.shipmentsToReceive
                    }, { root: true });
                }
                return response;
            } catch (error) {
                throw error;
            }
        },

    }
}

export default shipment;
