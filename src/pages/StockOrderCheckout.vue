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
            {{ (item.qty * item.price) | currency("P") }}
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
        <tr>
          <td class="caption text-xs-right" colspan="2">
            Discount
          </td>
          <td class="caption text-xs-right">
            <span v-if="discount">{{ discount }}%</span>
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

    <div class="text-xs-center mt-3 mb-3">
      <v-btn
        @click="submitStockOrder"
        depressed
        large
        color="primary"
        class="white--text"
        :disabled="stockOrder.items.length < 1"
      >
        <v-icon left>check_circle</v-icon> Submit Order to
        {{ $store.getters["GET_COMPANY"] }}
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
  </div>
</template>




<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
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
    loaderDialogMessage: null
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
      this.loaderDialog = true;
      this.loaderDialogMessage = "Submitting orders";

      this.$store
        .dispatch("stock_orders/SUBMIT", this.stockOrder)
        .then(res => {
          this.$router.push({
            name: "StockOrderCheckoutSuccess",
            params: {
              stockOrder: this.stockOrder,
              submittedAt: res.submittedAt
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  computed: {
    subTotal() {
      return this.stockOrder.items.reduce((a, b) => a + b.price * b.qty, 0);
    },

    discount() {
      let discount;
      if (this.subTotal >= 1500 && this.subTotal <= 2999) {
        discount = 10;
      } else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
        discount = 15;
      } else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
        discount = 18;
      } else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
        discount = 20;
      } else {
        discount = null;
      }
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
    }
  },
  components: {
    BasketBadge
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
