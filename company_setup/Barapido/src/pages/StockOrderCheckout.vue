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

    <table class="basket-table">
      <thead>
        <tr>
          <th class="border-bottom header-size grey--text text--darken-1">
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
          <td class="caption text-xs-right border-bottom">{{ item.qty }}</td>
          <td class="caption text-xs-right border-bottom">
            {{ (item.qty * item.resellerPrice) | currency("P") }}
          </td>
        </tr>
        <tr>
          <td colspan="3"></td>
        </tr>
        <!-- <tr>
          <td class="caption text-xs-right" colspan="2">
            Subtotal
          </td>
          <td class="caption text-xs-right">
            {{ subTotal | currency("P") }}
          </td>
        </tr>
        <tr>
          <td class="caption text-xs-right" colspan="2">
            Discount
          </td>
          <td class="caption text-xs-right">
            <span v-if="discount">{{ discount }}%</span>
          </td>
        </tr> -->
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

    <v-card>
      <v-card-title>
        <span class="title">Select Payment Option</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-container>
        <v-radio-group v-model="payment.paymentType">
          <v-radio label="Cash On Delivery (COD)" value="COD"></v-radio>
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
    </div>

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
    loaderDialogMessage: null,
    inAppBrowserRef: null
  }),
  created() {
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
        this.loaderDialogMessage = null;
        this.loaderDialog = false;
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
        return this.subTotal - (this.discount / 100) * this.subTotal;
      } else {
        return this.subTotal;
      }
    },
    ...mapState("payment", {
      paymentOccured: state => state.paymentOccured
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
