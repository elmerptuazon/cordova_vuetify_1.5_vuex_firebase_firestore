<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap align-center justify-center>
      
      <v-flex xs3 v-if="loading">
         <v-progress-circular
            indeterminate
            color="primary"
            :size="30"
            :width="3"
          ></v-progress-circular>
      </v-flex>

      <v-flex xs12 v-if="!shipmentList.length">
        <div class="font-weight-bold mt-3">
          There are still no receivable shipments...
        </div>
      </v-flex>
      <v-flex
        xs12
        v-else
        v-for="shipment in shipmentList"
        :key="shipment.trackingNumber"
      >
        <v-card class="mt-2" color="white">
          <v-card-title class="subheading">
            Shipment Tracking Number: {{ shipment.trackingNumber }}
          </v-card-title>
          <v-card-text>
            <v-layout align-center justify-space-around row wrap>
              <v-flex xs12>
                <v-data-table
                  hide-actions
                  :headers="headers"
                  :items="shipment.itemsToShip"
                  class="elevation-1"
                >
                  <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.productName }}</td>
                    <td class="text-xs-center">{{ props.item.qtyToShip }}</td>
                  </template>
                </v-data-table>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="
                shipment.status.toLowerCase() === 'completed' &&
                  shipment.lalamoveOrderDetails
              "
              class="primary"
              @click="TagShipmentAsReceived(shipment)"
              :loading="buttonLoading"
              :disabled="buttonLoading"
              >TAG THIS SHIPMENT AS RECEIVED</v-btn
            >
            <v-btn
              v-else-if="
                shipment.status.toLowerCase() === 'pending' &&
                  !shipment.lalamoveOrderDetails
              "
              class="primary"
              @click="TagShipmentAsReceived(shipment)"
              :loading="buttonLoading"
              :disabled="buttonLoading"
              >TAG THIS SHIPMENT AS RECEIVED</v-btn
            >
            <v-btn
              v-else-if="
                !shipment.isAddedToInventory && 
                  shipment.status.toLowerCase() === 'received'
              "
              class="primary"
              @click="AddShipmentToInventory(shipment)"
              :loading="buttonLoading"
              :disabled="buttonLoading"
              >ADD ITEM/S TO INVENTORY</v-btn
            >
            <v-btn 
              v-else-if="shipment.isAddedToInventory" 
              class="primary" 
              :disabled="true"
              >ITEM/s ALREADY IN THE INVENTORY</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

    <Modal ref="modal" />

  </v-container>
</template>

<script>
import { mapState } from "vuex";
import Modal from "@/components/Modal";
import { FIRESTORE, FB } from "@/config/firebaseInit";
export default {
  props: ["stockOrderId", "logisticProvider"],
  data: () => ({
    shipmentList: [],
    selectedItem: {},
    buttonLoading: false,
    headers: [
      {
        text: "Product Name",
        align: "center",
        sortable: true,
        value: "productName"
      },
      {
        text: "Qty to Receive",
        value: "qtyToShip",
        align: "center"
      }
    ],

    loading: false,

  }),
  async mounted() {
    this.loading = true;
    
    //run vuex to get corresponding shipment details for a stockOrder via the stockOrderId
    console.log(this.stockOrderId);
    await this.$store.dispatch("shipment/GetShipments", this.stockOrderId);
    this.shipmentList = this.$store.getters['shipment/GET_SHIPMENT_LIST'];

    console.log("SHIPMENTDETAILS COMPONENT: ", this.shipmentList);

    //if this stock order is being delivered through lalamove
    //re check the lalamove status of each shipments in this stock order
    if(this.logisticProvider === 'lalamove') {
      for(const shipment of this.shipmentList) {
      
        const status = shipment.status.toLowerCase();

        if(status !== 'completed' && status !== 'received') {
          await this.refreshShipmentStatus(shipment);
        }

      }

      this.shipmentList = this.shipmentList.filter((shipment) => {
          if(shipment.status.toLowerCase() === 'picked_up' || 
              shipment.status.toLowerCase() === 'completed' || 
              shipment.status.toLowerCase() === 'pending' ||
              shipment.status.toLowerCase() === 'received'
          ) return shipment;
      });

      this.loading = false;

    } else {

      this.shipmentList = this.shipmentList.filter((shipment) => {
          if(shipment.status.toLowerCase() === 'picked_up' || 
              shipment.status.toLowerCase() === 'completed' || 
              shipment.status.toLowerCase() === 'pending' ||
              shipment.status.toLowerCase() === 'received'
          ) return shipment;
      });

      this.loading = false;
    }

    this.loading = false;
    
  },
  methods: {
    async refreshShipmentStatus(shipment) {
      console.log('Refresh Shipment Status', shipment);
      const prevStatus = shipment.status.toLowerCase();

      let response;
      try {
        response = await this.$store.dispatch("lalamove/getOrderStatus", {
          customerOrderId: shipment.lalamoveOrderDetails.customerOrderId,
          orderRef: shipment.lalamoveOrderDetails.orderRef
        });
      }
      catch(error) {
        console.log(error);
      }
      
      console.log('SHIPMENT DETAILS STATUS:', response);
      shipment.status = response.status;
      shipment.price = response.price.amount;

      try {
        //update shipment status in DB when there is a new lalamove status
        if(prevStatus !== response.status.toLowerCase()) {
          console.log('updating shipment: ', shipment.id);
          await this.$store.dispatch("shipment/UpdateShipment", {
            id: shipment.id,
            trackingNumber: shipment.trackingNumber,
            update: {
              status: shipment.status,
              price: shipment.price
            }
          });

          //if the new lalamove status is picked_up, then increment the shipmentsToReceive counter in DB
          if(response.status.toLowerCase() === 'picked_up') {
            const shipmentIncrement =  FIRESTORE.FieldValue.increment(1);
            console.log('shipment increment: ', shipmentIncrement);
            console.log('updating shipment: ', shipment.id);
            await this.$store.dispatch("stock_orders/UPDATE_STOCK_ORDER_DETAILS",
              {
                id: this.stockOrderId,
                key: "shipmentsToReceive",
                value: shipmentIncrement,
              }
            ); 
          }
        }
      }
      catch(error) {
        console.log(error);
        this.statusBtn = false;
      }
    },
    async TagShipmentAsReceived(shipment) {
      this.buttonLoading = true;
      try {
        const shipmentDecrement = FIRESTORE.FieldValue.increment(-1);

        let updatedShipment = {};
        updatedShipment.id = shipment.id;
        updatedShipment.trackingNumber = shipment.trackingNumber;
        updatedShipment.update = {
          status: "Received",
          isAddedToInventory: false
        };
        //update counter in stockOrder
        updatedShipment.stockOrderId = shipment.stockOrder.stockOrderId;
        updatedShipment.stockOrderUpdate = {
          shipmentsToReceive: shipmentDecrement
        };

        await this.$store.dispatch("shipment/UpdateShipment", updatedShipment);
        this.$refs.modal.show(
          "Success",
          "Shipment has been tagged as Received!"
        );
        this.buttonLoading = false;
      } catch (error) {
        console.log(error);
        this.$refs.modal.show("Error", "An error occurred.");
        this.buttonLoading = false;
      }
    },
    async AddShipmentToInventory(shipment) {
      console.log(shipment);
      try {
        this.buttonLoading = true;
        const items = JSON.parse(JSON.stringify(shipment.itemsToShip));
        const res = await this.$store.dispatch(
          "inventory/ADD_ITEMS_FROM_STOCK_ORDER",
          items
        );
        if (res.success) {
          let updatedShipment = {};
          updatedShipment.id = shipment.id;
          updatedShipment.trackingNumber = shipment.trackingNumber;
          updatedShipment.update = {
            isAddedToInventory: true
          };
          await this.$store.dispatch(
            "shipment/UpdateShipment",
            updatedShipment
          );
          this.$refs.modal.show("Success", "All items added to inventory.");
        }
        this.buttonLoading = false;
      } catch (error) {
        console.log(error);
        this.$refs.modal.show("Error", "An error occurred.");
        this.buttonLoading = false;
      }
    }
  },
  components: {
    Modal
  },
  computed: {
    // ...mapState("shipment", {
    //   shipmentList: state => state.shipmentList.filter((shipment) => {
    //     if(shipment.status.toLowerCase() === 'picked_up' || 
    //         shipment.status.toLowerCase() === 'completed' || 
    //         shipment.status.toLowerCase() === 'pending' ||
    //         shipment.status.toLowerCase() === 'received'
    //     ) return shipment;
    //   })
    // })
  }
};
</script>
