<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles"
        >Stock Orders</v-toolbar-title
      >
      <v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container fluid>
      <v-stepper v-model="stepperCounter">
        <v-stepper-header>
          <v-stepper-step :complete="stepperCounter > 1" step="1"
            >Confirm Shipping Address</v-stepper-step
          >

          <v-divider></v-divider>

          <v-stepper-step :complete="stepperCounter > 2" step="2"
            >Shipment Options</v-stepper-step
          >

          <v-divider></v-divider>

          <v-stepper-step :complete="stepperCounter > 3" step="3"
            >Breakdown of Orders</v-stepper-step
          >

        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card flat>
              <v-container fluid class="pa-0">
                <span class="subheading text-xs-left font-weight-bold">Confirm Shipping Address</span>
              </v-container>
              <v-divider class="my-2"></v-divider>
              <v-container fluid class="pa-0">
                <v-layout align-center justify-center wrap>
                  <v-flex xs12>
                    <div class="body-1">The stock order will be delivered in this address:</div>
                  </v-flex>

                  <v-flex xs12 mt-3>
                    <div class="primary--text headline font-weight-bold">
                      {{ userAddress.house }}, {{ userAddress.streetName }}, {{ userAddress.barangay }}, {{ userAddress.citymun }},
                      {{ userAddress.province }}, {{ userAddress.zipCode }}
                    </div>
                  </v-flex>
                </v-layout>
              </v-container>

              <v-container>
                <v-layout row wrap align-center justify-center mt-4>
                  <v-flex xs12>
                    <v-btn block color="primary" depressed @click="stepperCounter += 1">
                      Continue
                      <v-icon class="ml-2" dark>arrow_forward</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs12 mt-2>
                    <v-btn flat block color="black" @click="goBack">
                      CANCEL
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card class="mb-2" flat>
              <v-container fluid class="pa-0">
                <span class="subheading text-xs-left font-weight-bold">Select Shipping Option</span>
              </v-container>
              <v-divider class="mt-2"></v-divider>
              <v-container fluid class="pa-1" style="width: 100%;">
                <v-layout row align-center justify-center>
                  <v-flex xs12>
                    <v-radio-group v-model="logisticsID" column>
                      <template v-slot:label>
                        <v-layout row wrap align-center justify-start>
                          <v-flex xs12 mt-2
                            v-for="logistics in logisticsProvider"
                            :key="logistics.id"
                          >
                            <v-card
                              style="width: 100%"
                              class="elavation-4 mt-2"
                              @click="logisticsID = logistics.id"
                            >
                              <v-container>
                                <v-layout row align-center justify-center>
                                  <v-flex xs5>
                                    <v-img
                                      :src="logistics.logoURL"
                                      height="125px"
                                      contain
                                    ></v-img>
                                  </v-flex>

                                  <v-flex xs6 pl-3>
                                    <div class="font-weight-bold subheading">
                                      {{ logistics.id.toUpperCase() }}
                                    </div>
                                    <div>
                                      <div v-if="logistics.id === 'pick-up'"></div>
                                      <div v-else>
                                        <span>
                                          + {{ userAddress.deliveryFee | currency("&#8369; ") }}
                                        </span>
                                      </div>
                                    </div>
                                  </v-flex>

                                  <v-flex xs1>
                                    <v-radio
                                      :value="logistics.id"
                                    ></v-radio>
                                  </v-flex>
                                </v-layout>
                              </v-container>
                            </v-card>
                          </v-flex>
                        </v-layout>
                      </template>
                    </v-radio-group>
                  </v-flex>
                </v-layout>
              </v-container>

              <v-container fluid class="pa-0 mt-2">
                <v-layout row wrap align-center justify-center>
                  <v-flex xs12>
                    <v-btn block color="primary" depressed @click="stepperCounter = 3">
                      Continue
                      <v-icon class="ml-2" dark>arrow_forward</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs12>
                    <v-btn flat block color="black" @click="stepperCounter = 1">
                      BACK
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card flat>
              <v-container fluid class="pa-0">
                <span class="subheading text-xs-left font-weight-bold">Breakdown of Orders</span>
              </v-container>
              <v-divider class="my-2"></v-divider>
              <v-container fluid class="pa-0 mt-2">
                <table class="basket-table">
                  <thead>
                    <tr>
                      <th
                        class="border-bottom header-size grey--text text--darken-1"
                      >
                        NAME
                      </th>
                      <th
                        class="border-bottom text-xs-right header-size grey--text text--darken-1"
                      >
                        QTY
                      </th>
                      <th
                        class="border-bottom text-xs-right header-size grey--text text--darken-1"
                      >
                        COST
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, i) in filterBy(
                        orderBy(stockOrder.items, 'created_at', -1),
                        search
                      )"
                      :key="i"
                    >
                      <td class="border-bottom">
                        <v-layout row>
                          <v-flex xs4>
                            <v-avatar tile size="40px">
                              <v-img
                                :src="item.image"
                                :alt="item.name"
                                class="elevation-1"
                              ></v-img>
                            </v-avatar>
                          </v-flex>
                          <v-flex xs8 pl-1>
                            <span v-html="item.name" class="caption"></span>
                            <br />
                            <span class="caption font-weight-bold">
                              {{ item.attributes | joinAttributes }}
                            </span>
                          </v-flex>
                        </v-layout>
                      </td>
                      <td class="caption text-xs-right border-bottom">
                        {{ item.qty }}
                      </td>
                      <td class="caption text-xs-right border-bottom">
                        {{ (item.qty * item.price) | currency('&#8369;') }}
                      </td>
                    </tr>

                    <tr>
                      <td colspan="3"></td>
                    </tr>

                    <tr>
                      <td class="caption text-xs-right" colspan="2">
                        Subtotal
                      </td>
                      <td class="caption text-xs-right">
                        {{ subTotal | currency('&#8369;') }}
                      </td>
                    </tr>

                    <tr>
                      <td class="caption text-xs-right" colspan="2">
                        Shipping Fee
                      </td>
                      <td class="caption text-xs-right">
                        <span>{{ shippingFee | currency('&#8369;') }}</span>
                      </td>
                    </tr>

                    <tr>
                      <td class="caption text-xs-right" colspan="2">
                        Total
                      </td>
                      <td class="caption text-xs-right">
                        <strong>{{ total | currency('&#8369;') }}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-container>
            </v-card>
            <v-container class="mt-4 px-3">
              <div class="text-xs-center mt-3 mb-3">
                <v-btn
                  @click="submitStockOrder"
                  depressed
                  large
                  color="primary"
                  class="white--text"
                  :disabled="stockOrder.items.length < 1"
                >
                  <v-icon left>check_circle</v-icon>
                  <span>
                    Submit Order
                  </span>
                </v-btn>
                <v-btn
                  flat block class="mt-3"
                  @click="stepperCounter -= 1"
                >Back</v-btn>
                </div>
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-container>

    <v-dialog v-model="loaderDialog" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ loaderDialogMessage }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <ConfirmationModal ref="finalizeOrder" @confirmClicked="finalizeOrder" />
    <Modal ref="modal" />
  </div>
</template>


<script>
import { mapState } from "vuex";
import { mixins } from "@/mixins";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
import ConfirmationModal from "@/components/ConfirmationModal";
import creditCardForm from "@/components/creditCardForm";
import Modal from "@/components/Modal";
import GCashGrabPayForm from "@/components/GCashGrabPayForm";

export default {
  mixins: [mixins],
  data: () => ({
    items: [],
    search: null,
    loading: false,
    loaderDialog: false,
    stockOrder: {
      id: null,
      items: [],
      userId: null,
      createdAt: null
    },

    userHasNoOrders: '',
    freeDeliveryCutOff: 0.00,

    logisticsID: "delivery",

    loaderDialogMessage: null,
    stepperCounter: 1,

  }),

  async mounted() {
    this.cordovaBackButton(this.goBack);

    this.loaderDialogMessage = 'Please Wait...';
    this.loaderDialog = true;

    this.checkoutHeight = window.innerHeight;
    this.checkoutWidth = window.innerWidth;

    let stockOrder;
    try {
      stockOrder = await this.$store.dispatch("stock_orders/GET");
    } catch(error) {
      console.log(error);
      this.loaderDialogMessage = null;
      this.loaderDialog = false;
    }

    if(!stockOrder.success) {
      this.loaderDialogMessage = null;
      this.loaderDialog = false;
      return;
    }

    this.stockOrder = Object.assign({}, stockOrder.data);

    let itemsToRemove = [];
    for(const item of this.stockOrder.items) {
      const variant = await this.$store.dispatch('variants/GET_VARIANT', {
        sku: item.sku,
        productId: item.productId
      });

      if(variant.isOutofStock) itemsToRemove.push(item);
      else if(item.qty > variant.availableQTY) itemsToRemove.push(items);
    }

    for(const item of itemsToRemove) {
      const index = this.stockOrder.items.findIndex(stockOrderItem => item.productId === stockOrderItem.productId);
      if(index !== -1) {
        this.stockOrder.items.splice(index, 1);
      }
    }

    try {
      const freeDelivery = await this.$store.dispatch('providers/GetFreeDeliveryCutOff');
      this.freeDeliveryCutOff = freeDelivery.cutOffPrice;
      this.loaderDialogMessage = null;
      this.loaderDialog = false;

    } catch(error) {
      console.log(error);
      this.loaderDialogMessage = null;
      this.loaderDialog = false;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    submitStockOrder() {
      this.$refs.finalizeOrder.show(
        "Confirm",
        "Are you sure you want to submit these orders to " +
          this.$store.getters["GET_COMPANY"] +
          "?"
      );
    },

    async finalizeOrder() {
      this.loaderDialog = true;
      this.loaderDialogMessage = "Submitting orders...";
      let user = this.$store.getters["accounts/user"];

      try {
        this.stockOrder.paymentDetails = {
          amount: Number(this.total),
          paymentStatus: '-',
          paymentType: 'payment receipt',
          proofOfPayment: null,
        };

        this.stockOrder.logisticsDetails = {
          logisticProvider: this.logisticsID,
          shippingFee: this.shippingFee
        };

        //this a flag that tells the dashboard that this is a new order and hasnt been read by the brand company.
        this.stockOrder.isRead = false;

        let result = await this.$store.dispatch(
          "stock_orders/SUBMIT",
          this.stockOrder
        );

        this.loaderDialog = false;
        this.loaderDialogMessage = null;

        this.$router.push({
          name: "StockOrderCheckoutSuccess",
          params: {
            stockOrder: this.stockOrder,
            submittedAt: result.submittedAt
          }
        });

      } catch (error) {
        console.log(error);
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        let errorMessage = 'An error occured while submiting your stock order.';
        let errorHeader = 'Error!';

        this.$refs.modal.show(errorHeader, errorMessage);
      
      }
    },

  },
  computed: {
    subTotal() {
      return this.stockOrder.items.reduce(
        (a, b) => a + Number(b.price) * Number(b.qty),
        0
      );
    },
    totalWeight() {
      const weight = this.stockOrder.items.reduce(
        (totalWeight, currentItem) =>
          totalWeight + currentItem.weight * currentItem.qty,
        0
      );

      return weight > 0 ? weight : 1;
    },
    discount() {
      let discount;
      return discount;
    },

    total() {
      return Number(this.subTotal) + Number(this.shippingFee);
    },

    shippingFee() {
      return this.logisticsID === 'pick-up' ? 0.00 : this.userAddress.deliveryFee;
    },

    userAddress() {
      const user = this.$store.getters["accounts/user"];
      return user.address;
    },

    variantList() {
      return this.$store.getters['variants/GET_VARIANTS'];
    },

    ...mapState("providers", {
      paymentProvider: state => state.paymentProvider,
      logisticsProvider: state => state.logisticsProvider
    })

  },
  filters: {
    joinAttributes(val) {
      const attributes = JSON.parse(JSON.stringify(val));
      delete attributes.qty;
      delete attributes.quantity;

      const keys = Object.keys(attributes);

      let str = "";

      keys.forEach(key => {
        str += `${key.toUpperCase()}: ${attributes[key]}`;
      });

      return str;
    }
  },
  components: {
    BasketBadge,
    ConfirmationModal,
    creditCardForm,
    Modal,
    GCashGrabPayForm
  },

  watch: {
    paymentOccured: function(val) {
      console.log(`payment ${val}`);
      if (val) {
        this.inAppBrowserRef.close();
      } else {
        this.inAppBrowserRef.close();
        this.$refs.finalizeOrder.close();
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.modal.show(
          "Transaction Failed",
          "Charging your card unsuccessful, please try again."
        );
        this.$store.commit("payment/SetPaymentOccured", null);
      }
    }
  }
};
</script>

<style scoped>
.basket-table {
  overflow-x: auto;
  border-collapse: collapse;
}

.basket-table {
  width: 100%;
  border-collapse: collapse;
}

.basket-table td,
.basket-table th {
  border: 1px sold #ddd;
  padding: 8px;
}

.basket-table td.border-bottom {
  border-bottom: 1px solid #ddd;
}

.basket-table th.border-bottom {
  border-bottom: 1px solid #1976d2;
}

.header-size {
  font-size: 10px;
}

tr.border-top td {
  border-top: 1pt solid #d0d0d0;
}

.icon {
  display: inline-flex !important;
}
</style>
