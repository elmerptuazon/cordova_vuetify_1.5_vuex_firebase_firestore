<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex
        xs12
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
              v-if="shipment.status === 'Pending'"
              class="primary"
              @click="AddShipmentToInventory(shipment)"
              :loading="buttonLoading"
              :disabled="buttonLoading"
              >Receive Items</v-btn
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
export default {
  props: ["stockOrderId"],
  data: () => ({
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
    ]
  }),
  created() {
    //run vuex to get corresponding shipment details for a stockOrder via the stockOrderId
    console.log(this.stockOrderId);
    this.$store.dispatch("shipment/GetShipments", this.stockOrderId);
  },
  methods: {
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
            status: "Received"
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
    ...mapState("shipment", {
      shipmentList: state => state.shipmentList
    })
  }
};
</script>
