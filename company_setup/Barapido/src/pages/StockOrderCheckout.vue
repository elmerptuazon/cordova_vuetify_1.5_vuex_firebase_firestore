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
      <Logo />
    </v-toolbar>

    <v-stepper v-model="stepperCounter">
      <v-stepper-header>
        <v-stepper-step :complete="stepperCounter > 1" step="1"
          >Shipment Options</v-stepper-step
        >

        <v-divider></v-divider>

        <v-stepper-step :complete="stepperCounter > 2" step="2"
          >Payment Options</v-stepper-step
        >

        <v-divider></v-divider>
        <v-stepper-step step="3">Submit Order</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
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
                >
                  <v-card-title>
                    <v-radio :value="logistics.id"></v-radio>
                    <span class="subheading">{{
                      logistics.id.toUpperCase()
                    }}</span>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-layout>
                      <v-flex xs5>
                        <v-img
                          :src="logistics.logoURL"
                          height="125px"
                          contain
                        ></v-img>
                      </v-flex>
                      <v-flex xs7>
                        <v-card-title primary-title>
                          <div>
                            <div class="subheading">Shipping Fee:</div>
                            <div>+ PHP {{ logistics.shippingFee }}</div>
                          </div>
                        </v-card-title>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
              </v-radio-group>
            </v-container>
          </v-card>
          <v-btn color="primary" @click="stepperCounter = 2">
            Continue
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-5">
            <v-card-title>
              <span class="body-2">Breakdown of Orders</span>
            </v-card-title>
            <v-divider></v-divider>
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
                    {{ subTotal | currency("P") }}
                  </td>
                </tr>
                <!-- <tr>
                  <td class="caption text-xs-right" colspan="2">
                    Discount
                  </td>
                  <td class="caption text-xs-right">
                    <span v-if="discount">{{ discount }}%</span>
                  </td>
                </tr> -->
                <tr>
                  <td class="caption text-xs-right" colspan="2">
                    Shipping Fee
                  </td>
                  <td class="caption text-xs-right">
                    <span>{{ shippingFee | currency("P") }}</span>
                  </td>
                </tr>
                <tr>
                  <td class="caption text-xs-right" colspan="2">
                    Total
                  </td>
                  <td class="caption text-xs-right">
                    <strong>{{ total | currency("P") }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </v-card>
          <v-btn color="primary" @click="stepperCounter = 3">
            Continue
          </v-btn>

          <v-btn flat @click="stepperCounter = 1">Back</v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card class="mb-5">
            <v-card-title>
              <span class="body-2">Select Payment Option</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
              <v-radio-group v-model="payment.paymentType">
                <v-radio
                  label="Cash On Delivery (COD)/Upon pick-up"
                  value="COD"
                ></v-radio>
                <v-radio
                  label="Credit Card (Visa and Mastercard Only)"
                  value="CC"
                ></v-radio>
                <v-divider v-if="payment.paymentType === 'CC'"></v-divider>
                <creditCardForm
                  v-if="payment.paymentType === 'CC'"
                  @cardDetails="SetCardDetails"
                />
              </v-radio-group>
            </v-container>
          </v-card>
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
              <span v-if="payment.paymentType === 'COD'">
                Submit Order
              </span>
              <span v-else>
                Pay and Submit Order
              </span>
            </v-btn>
            <v-btn flat @click="stepperCounter = 2">Back</v-btn>
          </div>
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
      cardDetails: null
    },

    logisticsID: "pick-up",
    loaderDialogMessage: null,
    inAppBrowserRef: null,
    stepperCounter: 0
  }),
  mounted() {
    this.cordovaBackButton(this.goBack);
    this.loaderDialog = true;
    this.loaderDialogMessage = "Please wait";
    this.$store
      .dispatch("stock_orders/GET")
      .then(res => {
        console.log(res.data);
        if (res.success) {
          this.stockOrder = Object.assign({}, res.data);
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.invokeShippingCalculation().then(() => {
          this.loaderDialogMessage = null;
          this.loaderDialog = false;
        });
      });
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
      this.loaderDialogMessage = "Submitting orders";

      try {
        let paymentResult = null;

        this.payment.amount = this.total;
        this.stockOrder.logisticsDetails = {
          logisticProvider: this.logisticsID,
          shippingFee: this.shippingFee
        };

        //check kung CC or COD
        if (this.payment.paymentType === "CC") {
          //validate card details
          if (
            !this.$cardFormat.validateCardNumber(
              this.payment.cardDetails.cardNumber
            )
          ) {
            this.loaderDialog = false;
            this.loaderDialogMessage = null;
            this.$refs.finalizeOrder.close();
            this.$refs.modal.show(
              "Card Details",
              "Please check your card number."
            );
            return;
          }
          // validate card expiry
          if (
            !this.$cardFormat.validateCardExpiry(
              this.payment.cardDetails.expiry
            )
          ) {
            this.loaderDialog = false;
            this.loaderDialogMessage = null;
            this.$refs.finalizeOrder.close();
            this.$refs.modal.show(
              "Card Details",
              "Please check your card expiry."
            );
            return;
          }
          // validate card CVC
          if (!this.$cardFormat.validateCardCVC(this.payment.cardDetails.CVC)) {
            this.loaderDialog = false;
            this.loaderDialogMessage = null;
            this.$refs.finalizeOrder.close();
            this.$refs.modal.show(
              "Card Details",
              "Please check your card CVC."
            );
            return;
          }

          const user = this.$store.getters["accounts/user"];
          let userDetails = {
            name: `${user.lastName}, ${user.firstName} ${user.middleInitial}`,
            email: user.email,
            phone: user.contact
          };

          //process payment
          paymentResult = await this.$store.dispatch(
            "payment/PayOrderThruCreditCard",
            {
              payment: this.payment,
              userDetails: userDetails,
              stockOrder: this.stockOrder
            }
          );
          //check if it has a checkout_URL, if none proceed to regular update
          console.log(paymentResult);
          if (paymentResult.checkout_url) {
            //save details for logisticsDetails
            this.$store.dispatch("stock_orders/UPDATE_STOCK_ORDER", {
              id: this.stockOrder.id,
              key: logisticsDetails,
              value: this.stockOrder.logisticsDetails
            });
            //dispatch listener for CC Payment
            //listener for CC Payment should update the stock order based on the details and then push it to stockOrderCheckoutSuccess
            this.$store.dispatch(
              "payment/ListenToPaymentStatus",
              this.stockOrder
            );
            //open the webview for the URL returned
            const url = paymentResult.checkout_url;
            const target = "_blank";
            const options = `location=no,hardwareback=no,footer=yes,closebuttoncaption=DONE,closebuttoncolor=#ffffff,footercolor=${process.env.primaryColor}`;
            this.inAppBrowserRef = cordova.InAppBrowser.open(
              url,
              target,
              options
            );
          }
        } else {
          paymentResult = await this.$store.dispatch(
            "payment/ProcessCODOrder",
            {
              payment: this.payment
            }
          );

          this.stockOrder.paymentDetails = paymentResult;

          console.log(this.stockOrder);
          //this flow will always result to success, any error should be thrown
          //and handled in the catch statement
          let result = await this.$store.dispatch(
            "stock_orders/SUBMIT",
            this.stockOrder
          );
          this.$router.push({
            name: "StockOrderCheckoutSuccess",
            params: {
              stockOrder: this.stockOrder,
              submittedAt: result.submittedAt
            }
          });
        }
      } catch (error) {
        //add catch for incorrect payment/credit cards.
        console.log(error);
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();
        // switch (error.errors[0].code) {
        //   case "generic_decline":
        //     this.$refs.modal.show(
        //       "Transaction Failed",
        //       "Your card has been declined, please contact your service provider."
        //     );
        //     break;
        //   case "insufficient_funds":
        //     this.$refs.modal.show(
        //       "Transaction Failed",
        //       "Your card has insufficient funds, please contact your service provider."
        //     );
        //     break;
        //   default:
        //     this.$refs.modal.show(
        //       "Transaction Failed",
        //       "Charging your card unsuccessful, please contact your service provider."
        //     );
        // }
        this.$refs.modal.show(
          "Transaction Failed",
          "Charging your card unsuccessful, check the details and try again."
        );
      }
    },
    async invokeShippingCalculation() {
      //invoke some please wait here
      const user = this.$store.getters["accounts/user"];
      await this.$store.dispatch("providers/CalculateShipping", {
        itemWeight: this.totalWeight,
        toAddress: user.address
      });
      //this.stepperCounter = 2;
    },
    SetCardDetails(card) {
      this.payment.cardDetails = card;
    }
  },
  computed: {
    subTotal() {
      return this.stockOrder.items.reduce(
        (a, b) => a + b.resellerPrice * b.qty,
        0
      );
    },
    totalWeight() {
      return this.stockOrder.items.reduce(
        (totalWeight, currentItem) =>
          totalWeight + currentItem.weight * currentItem.qty,
        0
      );
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
      if (this.discount) {
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
        str += `${key}:${attributes[key]}`;
      });

      return str;
    }
  },
  components: {
    BasketBadge,
    ConfirmationModal,
    creditCardForm,
    Modal
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
