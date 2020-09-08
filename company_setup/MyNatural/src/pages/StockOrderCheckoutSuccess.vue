<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-toolbar-title class="mx-auto" v-if="$store.state.showToolbarTitles"
        >Checkout Success</v-toolbar-title
      >
    </v-toolbar>

    <v-container class="pa-0 pt-3 ma-0" grid-list-xs fluid>
      <div>
        <CheckMark />

        <div>
          <p class="text-xs-center primary--text headline mt-3 mb-1">
            Thank you for your order!
          </p>
          <div v-if="order.paymentType === 'CC'">
            <v-layout row wrap class="mt-0" justify-space-between>
              <v-flex xs1></v-flex>
              <v-flex xs10>
                <div class="text-xs-center">
                  <span class="body-1 mt-0 ">
                    Your credit card payment has been accepted! and your order
                    has been forwarded to the company.
                  </span>
                </div>
              </v-flex>
              <v-flex xs1></v-flex>
            </v-layout>
          </div>
          <div v-else-if="order.paymentType === 'GCash' || order.paymentType === 'GrabPay'">
            <v-layout row wrap class="mt-0" justify-space-between>
              <v-flex xs1></v-flex>
              <v-flex xs10>
                <div class="text-xs-center">
                  <span class="body-1 mt-0 ">
                    Your E-Wallet payment has been accepted! and your order
                    has been forwarded to the company.
                  </span>
                </div>
              </v-flex>
              <v-flex xs1></v-flex>
            </v-layout>
          </div>
          <p v-else class="text-xs-center body-1 mt-0">
            Your order has been forwarded to the company.
          </p>
        </div>

        <v-divider class="mt-3"></v-divider>

        <div class="px-3 mt-3">
          <v-layout row wrap class="mt-2">
            <v-flex xs6>
              <div class="text-xs-left body-1">
                Order Reference Number:
              </div>
            </v-flex>
            <v-flex xs6>
              <div class="text-xs-right body-2">
                {{ order.stockOrderReference }}
              </div>
            </v-flex>
          </v-layout>

          <v-layout row wrap class="mt-2">
            <v-flex xs6>
              <div class="text-xs-left body-1">
                Create Date:
              </div>
            </v-flex>
            <v-flex xs6>
              <div class="text-xs-right body-2">
                {{ order.createdAt | momentify("DD-MMM-YYYY") }}
              </div>
            </v-flex>
          </v-layout>

          <v-layout row wrap class="mt-2">
            <v-flex xs6>
              <div class="text-xs-left body-1">
                Submit Date:
              </div>
            </v-flex>
            <v-flex xs6>
              <div class="text-xs-right body-2">
                {{ order.submittedAt | momentify("DD-MMM-YYYY") }}
              </div>
            </v-flex>
          </v-layout>

          <v-layout row wrap class="mt-2">
            <v-flex xs6>
              <div class="text-xs-left body-1">
                Total:
              </div>
            </v-flex>
            <v-flex xs6>
              <div class="text-xs-right body-2">
                {{ order.total | currency("P ") }}
              </div>
            </v-flex>
          </v-layout>
        </div>

        <div class="text-xs-center mt-3 px-5 mt-4">
          <v-btn block @click="goToOrder" depressed large color="grey" dark
            >View Stock Order</v-btn
          >
          <v-btn
            block
            @click="backToCatalogue"
            depressed
            large
            color="primary"
            dark
            >Back to Products list</v-btn
          >
        </div>
      </div>
    </v-container>
  </div>
</template>



<script>
import { date } from "@/mixins/date";
import { mixins } from "@/mixins";
import { mapGetters } from "vuex";
import CheckMark from "@/components/CheckMark";

export default {
  data: () => ({
    order: {
      createdAt: null,
      submittedAt: null,
      total: null,
      paymentType: null,
      stockOrderReference: null,
      paymentReference: null
    }
  }),
  components: {
    CheckMark
  },
  created() {
    const stockOrder = this.$route.params.stockOrder;
    const submittedAt = this.$route.params.submittedAt;

    this.order = {
      createdAt: stockOrder.createdAt,
      submittedAt: submittedAt,
      total:
        stockOrder.items.reduce((a, b) => a + b.resellerPrice * b.qty, 0) +
        stockOrder.logisticsDetails.shippingFee,
      paymentType: stockOrder.paymentDetails.paymentType,
      stockOrderReference: stockOrder.stockOrderReference,
      paymentReference: stockOrder.paymentDetails.transactionNumber || null
    };

    if(stockOrder.logisticsDetails.isFreeShipping) {
      this.order.total = stockOrder.items.reduce((a, b) => a + b.resellerPrice * b.qty, 0);
    }
  },
  methods: {
    goToOrder() {
      this.$router.push({
        name: "ViewStockOrder",
        params: { id: this.$route.params.stockOrder.id }
      });
    },
    backToCatalogue() {
      this.$router.push({ name: "Catalogue" });
    }
  },
  mixins: [date, mixins]
};
</script>

