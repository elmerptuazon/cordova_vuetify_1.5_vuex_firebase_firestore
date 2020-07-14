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

        <v-stepper-step :complete="stepperCounter === 3" step="3"
          >Breakdown of Orders</v-stepper-step
        >

        <!-- <v-stepper-step :complete="stepperCounter > 3" step="3"
          >Payment Options</v-stepper-step
        > -->

        <!-- <v-divider></v-divider>
        <v-stepper-step step="4">Submit Order</v-stepper-step> -->
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card flat>
            <v-card-title>
              <span class="body-2">Confirm Shipping Address</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
              <v-layout align-center justify-center wrap>
                <v-flex xs12>
                  <div class="caption">The stock order will be delivered in this address:</div>
                </v-flex>

                <v-flex xs12 mt-3>
                  <div class="primary--text headline font-weight-bold">
                    {{ userAddress.house }}, {{ userAddress.streetName }}, {{ userAddress.barangay }}, {{ userAddress.citymun }},
                    {{ userAddress.province }}, {{ userAddress.zipCode }}
                  </div>
                </v-flex>

                <v-flex xs12 mt-3>
                  <div class="font-italic caption">
                    To change this shipping address, kindly go to your profile page and change your address.
                    or <b class="body-1 primary--text font-weight-bold" @click="$router.push({name: 'EditProfile'})">CLICK HERE</b> to go to Edit Profile Page.
                  </div>
                </v-flex>
              </v-layout>
            </v-container>

            <v-container>
              <v-layout align-center justify-center mt-3>
                <v-flex xs3>
                  <v-btn flat color="black" @click="goBack">
                    CANCEL
                  </v-btn>
                </v-flex>
                <v-flex xs3 offset-xs1>
                  <v-btn color="primary" depressed @click="startQuotations">
                    Continue
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-2" flat>
            <v-card-title>
              <span class="body-2">Select shipping option</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
              <v-radio-group v-model="logisticsID">
                <v-card
                  v-for="logistics in logisticsProvider"
                  :key="logistics.id"
                  min-width="275px"
                  class="mt-2"
                >
                  <v-container>
                    <v-layout row align-center justify-start mx-2>
                      <v-flex xs5>
                        <v-img
                          :src="logistics.logoURL"
                          height="125px"
                          contain
                        ></v-img>
                      </v-flex>

                      <v-flex xs5 offset-xs1>
                        <div>
                          <div class="subheading">{{ logistics.id.toUpperCase() }}</div>
                          <div 
                            v-if="subTotal >= freeDeliveryCutOff && 
                              logistics.id !== 'pick-up'
                            " 
                            class="primary--text"
                          > FREE SHIPPING</div>
                          <div v-else-if="logistics.shippingFee === 'error'">ERROR</div>
                          <div v-else>+ {{ logistics.shippingFee | currency('&#8369; ') }} </div>
                        </div>
                      </v-flex>

                      <v-flex xs1>
                        <v-radio :value="logistics.id"></v-radio>
                      </v-flex>

                    </v-layout>
                  </v-container>
                  <!-- <v-divider class="my-2 black"></v-divider> -->
                </v-card>

                <v-layout align-center justify-end row px-6 mt-4>
                  <v-flex xs4 mr-2>
                    <v-btn color="black" flat @click="stepperCounter = 1">
                      BACK
                    </v-btn>
                  </v-flex>
                  <v-flex xs4>
                    <v-btn color="primary" depressed @click="stepperCounter = 3">
                      Continue
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-radio-group>
            </v-container>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card>
            <v-card-title>
              <span class="body-2">Breakdown of Orders</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
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
                        <v-flex xs8>
                          <span v-html="item.name" class="caption"></span>
                          <br />
                          <span class="caption">
                            {{ item.attributes | joinAttributes }}
                          </span>
                        </v-flex>
                      </v-layout>
                    </td>
                    <td class="caption text-xs-right border-bottom">
                      {{ item.qty }}
                    </td>
                    <td class="caption text-xs-right border-bottom">
                      {{ (item.qty * item.resellerPrice) | currency("P") }}
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
                      {{ subTotal | currency("&#8369;") }}
                    </td>
                  </tr>
                  <tr>
                    <td class="caption text-xs-right" colspan="2">
                      Shipping Fee
                    </td>
                    <td class="caption text-xs-right">
                      <span 
                        v-if="subTotal >= freeDeliveryCutOff" 
                        class="primary--text"
                      >FREE</span>
                      <span v-else>{{ shippingFee | currency("&#8369;") }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="caption text-xs-right" colspan="2">
                      Total
                    </td>
                    <td class="caption text-xs-right">
                      <strong>{{ total | currency("&#8369;") }}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-container>
          </v-card>
          <v-container class="px-3">
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
              <v-btn flat @click="stepperCounter = 2">Back</v-btn>
            </div>
          </v-container>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <v-dialog v-model="loaderDialog" hide-overlay persistent width="300">
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
    
    payment: {
      paymentType: "COD",
      amount: null,
      cardDetails: null,
      accountDetails: null,
    },

    userHasNoOrders: '',
    freeDeliveryCutOff: 0.00,

    logisticsID: "pick-up",
    loaderDialogMessage: null,
    stepperCounter: 0,

  }),
  
  async mounted() {
    this.cordovaBackButton(this.goBack);
    
    this.loaderDialogMessage = 'Please Wait...';
    this.loaderDialog = true;
    
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
    
    async startQuotations() {
      this.loaderDialog = true;
      this.loaderDialogMessage = "Please wait";

      try {
        const user = this.$store.getters["accounts/user"];
        await this.$store.dispatch("providers/CalculateShipping", {
          itemWeight: this.totalWeight,
          toAddress: user.address
        });

        this.loaderDialogMessage = null;
        this.loaderDialog = false;
        console.log('logistics provider:', this.logisticsProvider);
        this.stepperCounter = 2;
      
      } catch(error) {
        console.log(error);
        this.loaderDialogMessage = null;
        this.loaderDialog = false;
        this.stepperCounter = 2;

        let msg;
        
        if(error.logisticsID === 'barapido') {
          //print corresponding error messages of barapido api error
          if(error.response.data === 'Error: itemWeight exceeds the weight limit.') {
            msg = 'Weight of the Stock Order exceeds the weight delivery requirement';
        
          } else if(error.response.data === "Error: TypeError: Cannot read property '0' of undefined") {
            msg = 'Weight of the Stock Order is invalid.'

          } else {
            msg = 'An error occured. Please try again...';
          }
        }

        this.$refs.modal.show(
          `${error.logisticsID} Delivery Quotation Error`,
          msg
        );
      }

    },
    
    async finalizeOrder() {
      this.loaderDialog = true;
      this.loaderDialogMessage = "Submitting orders...";
      let user = this.$store.getters["accounts/user"];

      try {
        let paymentResult = null;

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
        
        //determine if this shipping is free
        this.stockOrder.logisticsDetails.isFreeShipping = this.subTotal >= this.freeDeliveryCutOff;

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
        //add catch for incorrect payment/credit cards.
        console.log(error);
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        let errorMessage = 'An error occured while submitting your order to the company.'; 
        let errorHeader = 'Error!';

        this.$refs.modal.show(errorHeader, errorMessage);
      }
    },
  },
  computed: {
    subTotal() {
      return this.stockOrder.items.reduce(
        (a, b) => a + b.resellerPrice * b.qty,
        0
      );
    },
    totalWeight() {
      const weight = this.stockOrder.items.reduce(
        (totalWeight, currentItem) =>
          totalWeight + currentItem.weight * currentItem.qty,
        0
      );

      return weight > 0 ? weight : 1000;
    },
    discount() {
      let discount;
      // if (this.subTotal >= 1500 && this.subTotal <= 2999) {
      //   discount = 10;
      // } else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
      //   discount = 15;
      // } else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
      //   discount = 18;
      // } else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
      //   discount = 20;
      // } else {
      //   discount = null;
      // }
      return discount;
    },

    total() {
      const isFreeDelivery = this.subTotal >= this.freeDeliveryCutOff;

      if(this.discount && isFreeDelivery) { 
        //dont include delivery free if stock order amount exceeds the freeDeliveryCutOff price quota
        return (
          this.subTotal -
          (this.discount / 100) * this.subTotal
        );

      } else if(isFreeDelivery) {
        return this.subTotal;

      } else if (this.discount) {
        return (
          this.subTotal -
          (this.discount / 100) * this.subTotal +
          this.shippingFee
        );
      } else {
        return this.subTotal + this.shippingFee;
      }
    },
    shippingFee() {
      const logisticsData = this.logisticsProvider.find(
        logistics => logistics.id === this.logisticsID
      );

      return logisticsData.shippingFee;
    },

    totalIsInMinimumPrice() {
      return this.total < 100 ? true : false; 
    },

    totalIsInMaximumPrice() {
      return this.total > 100000 ? true : false;
    },

    userAddress() {
      const user = this.$store.getters["accounts/user"];
      return user.address;
    },
    ...mapState("payment", {
      paymentOccured: state => state.paymentOccured
    }),
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
        str += `${key.toUpperCase()}: ${attributes[key]}\n`;
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

    //   paymentOccured(newValue, oldValue) {
    //     console.log(`payment from ${oldValue} to ${newValue}`);
    //     if (val) {
    //       this.inAppBrowserRef.close();
    //     }
    //   }
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
