<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container>
      <v-card class="mx-auto">
        <v-card-title>
          <span class="subheading font-weight-medium">Stock Order Details</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="body-2 font-weight-regular">
          <div>
            <div>
              <span
                >Reference Number: {{ stockOrder.stockOrderReference }}</span
              >
            </div>
            <div>
              Date Ordered:
              {{ stockOrder.submittedAt | momentify("DD-MMM-YYYY") }}
            </div>
            <div>
              Status:
              <v-chip
                :class="[
                  stockOrder.status != 'pending' ? 'green' : 'red darken-2'
                ]"
                text-color="white"
              >
                {{ stockOrder.status }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-title>
          <span class="subheading font-weight-medium">Payment Details</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div>
            <span v-if="stockOrder.paymentDetails.paymentType === 'CC'"
              >Type: Credit Card</span
            >
            <span v-else-if="stockOrder.paymentDetails.paymentType === 'GCash'"
              >Type: GCash</span
            >
            <span v-else-if="stockOrder.paymentDetails.paymentType === 'GrabPay'"
              >Type: Grab Pay</span
            >
            <span v-else>Type: Cash on Delivery</span>
          </div>
          <div>
            Amount Paid:
            {{ stockOrder.paymentDetails.amount | currency("P ") }}
          </div>
          <div>
            Status:
            <v-chip
              :class="[
                stockOrder.paymentDetails.paymentStatus != 'Pending'
                  ? 'green'
                  : 'red darken-2'
              ]"
              text-color="white"
            >
              {{ stockOrder.paymentDetails.paymentStatus }}
            </v-chip>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-title>
          <span class="subheading font-weight-medium">Shipping Provider</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div>
            <span v-if="stockOrder.logisticsDetails"
              >Provider:
              {{
                stockOrder.logisticsDetails.logisticProvider | uppercase
              }}</span
            >
            <span v-else>Provider: N/A</span>
          </div>
          <div>
            <span v-if="stockOrder.logisticsDetails.isFreeShipping">Shipping Fee: FREE</span>
            <span v-else-if="stockOrder.logisticsDetails"
              >Shipping Fee: {{ stockOrder.logisticsDetails.shippingFee | currency("P ") }}</span
            >
            <span v-else>Shipping Fee: N/A</span>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
    <br />
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
              <v-flex xs3>
                <v-avatar tile size="40px">
                  <v-img :src="item.image" :alt="item.name" contain></v-img>
                </v-avatar>
              </v-flex>
              <v-flex xs9>
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

    <v-card
      v-if="
        stockOrder.status === 'shipped' ||
          stockOrder.status === 'partially shipped'
      "
    >
      <v-card-title class="subheading font-weight-medium"
        >Shipments to Receive</v-card-title
      >
      <ShipmentDetails :stockOrderId="$route.params.id" :stockOrder="stockOrder"/>
    </v-card>

    <!-- <div class="text-xs-center mt-3 mb-3" v-if="!stockOrder.addedToInventory">
      <v-btn
        :loading="loading"
        :disabled="loading"
        @click="addToInventory"
        depressed
        large
        class="primary white--text"
        v-if="
          stockOrder.status === 'delivered' || stockOrder.status === 'collected'
        "
      >
        <v-icon left>check_circle</v-icon> Add Stock to Inventory
      </v-btn>
    </div> -->

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

    <Modal ref="modal" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import { date } from "@/mixins/date";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
import ShipmentDetails from "@/components/ShipmentDetails";
import Modal from "@/components/Modal";

export default {
  mixins: [date, mixins],
  data: () => ({
    search: null,
    loading: false,
    loaderDialog: false,
    stockOrder: {
      id: null,
      items: [],
      userId: null,
      createdAt: null,
      paymentDetails: {
        amount: null,
        paymentStatus: null,
        paymentType: null
      }
    },
    loaderDialogMessage: null,
  }),
  mounted() {
    this.cordovaBackButton(this.goBack);

    this.loaderDialog = true;
    this.loaderDialogMessage = "Please wait...";
    this.$store
      .dispatch("stock_orders/FIND", this.$route.params.id)
      .then(res => {
        if (res.success) {
          console.log(res);
          console.log(this.stockOrder);
          this.stockOrder = Object.assign({}, this.stockOrder, res.data);
          console.log(this.stockOrder);
          if (
            (!this.stockOrder.read &&
              this.stockOrder.status === "processing") ||
            (!this.stockOrder.read && this.stockOrder.status === "cancelled")
          ) {
            this.$store.dispatch("stock_orders/UPDATE_STOCK_ORDER", {
              id: this.stockOrder.id,
              key: "read",
              value: true
            });
          }
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
      this.$router.push({
        name: "Orders",
        query: {
          tab: "tab2"
        }
      });
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
      // 	discount = 10;
      // } else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
      // 	discount = 15;
      // } else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
      // 	discount = 18;
      // } else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
      // 	discount = 20;
      // } else {
      // 	discount = null;
      // }
      return discount;
    },

    total() {
      if (this.discount) {
        return this.subTotal - (this.discount / 100) * this.subTotal;
      } else {
        return this.subTotal;
      }
    }
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
    },
    uppercase(v) {
      return v.toUpperCase();
    }
  },
  components: {
    BasketBadge,
    Modal,
    ShipmentDetails
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
