<template>
  <div>
    <v-toolbar
      app
      color="primary"
      dark
      :extended="extended"
      v-if="$store.state.rightAlignToolbarIcons"
    >
      <v-btn icon @click="back" v-if="user.type === 'Reseller'">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <Accounts />
      <div v-if="$store.state.showToolbarTitles">
        <v-toolbar-title v-if="user.type === 'Customer'"
          >Orders</v-toolbar-title
        >
        <v-toolbar-title v-else-if="user.type === 'Reseller'"
          >Your Orders</v-toolbar-title
        >
      </div>
      <v-text-field
        v-model="search"
        label="Search order..."
        clearable
        v-if="extended"
        slot="extension"
        class="mx-3"
        flat
        solo-inverted
        prepend-icon="search"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn icon @click="goToBasket">
        <v-badge right color="red" overlap v-model="showBadge">
          <span slot="badge">{{ GET_ITEMS_LENGTH }}</span>
          <v-icon>shopping_cart</v-icon>
        </v-badge>
      </v-btn>
      <v-btn icon @click="extended = !extended">
        <v-icon v-if="!extended">search</v-icon>
        <v-icon v-else>close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-toolbar app color="primary" dark :extended="extended" v-else>
      <v-btn icon @click="back" v-if="user.type === 'Reseller'">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <div v-if="$store.state.showToolbarTitles">
        <v-toolbar-title v-if="user.type === 'Customer'"
          >Orders</v-toolbar-title
        >
        <v-toolbar-title v-else-if="user.type === 'Reseller'"
          >Your Orders</v-toolbar-title
        >
      </div>
      <v-text-field
        v-model="search"
        label="Search order..."
        clearable
        v-if="extended"
        slot="extension"
        class="mx-3"
        flat
        solo-inverted
        prepend-icon="search"
      ></v-text-field>
      <v-btn icon @click="goToBasket">
        <v-badge right color="red" overlap v-model="showBadge">
          <span slot="badge">{{ GET_ITEMS_LENGTH }}</span>
          <v-icon>shopping_cart</v-icon>
        </v-badge>
      </v-btn>
      <v-btn icon @click="extended = !extended">
        <v-icon v-if="!extended">search</v-icon>
        <v-icon v-else>close</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container class="pa-0">
      <v-data-table
        :headers="headers"
        :items="GET_ORDERS"
        hide-actions
        :loading="loader"
        :search="search"
      >
        <template slot="items" slot-scope="props">
          <tr @click="viewOrder(props.item.orderNo)">
            <td class="pa-2">
              <span class="body-1"> {{ props.item.orderNo }} </span> <br />
              <span class="caption"
                >Status: {{ props.item.status | status }}</span
              >
            </td>
            <td class="text-xs-center body-1">
              {{ props.item.created_at | momentify("DD-MMM-YYYY") }}
            </td>
            <td class="text-xs-center body-1">
              {{ props.item.total | currency("P") }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-container>

    <BottomNav currentTab="basket" />
  </div>
</template>


<script>
import { date } from "@/mixins/date";
import { mixins } from "@/mixins";
import { mapGetters } from "vuex";
import { Spinner } from "mint-ui";
import BottomNav from "@/components/BottomNav";
export default {
  data: () => ({
    extended: false,
    search: null,
    loader: false,
    headers: [
      { text: "Order No.", value: "orderNo", align: "left" },
      { text: "Date", value: "created_at", align: "center" },
      { text: "Total", value: "total", align: "center" }
    ]
  }),
  created() {
    this.loader = true;
    this.$store
      .dispatch("orders/GET_ORDERS")
      .then(() => {
        this.loader = false;
      })
      .catch(e => {
        console.error(e);
        this.loader = false;
      });
  },
  methods: {
    back() {
      // this.$events.$emit('SET_CURRENT_TAB', 'orders')
      this.$router.push({ name: "Orders" });
    },
    goToBasket() {
      // if (!this.GET_SUBTOTAL) return false
      this.$router.push({
        name: "Basket",
        params: {
          previousRoute: this.$router.history.current.name,
          previousTab: "basket"
        }
      });
    },
    viewOrder(orderNo) {
      this.Indicator().open();
      console.log(`order no: ${orderNo} invoke dispatch`);
      this.$store.dispatch("orders/GET_ORDER", orderNo).then(response => {
        this.Indicator().close();
        this.$router.push({
          name: "Order",
          params: {
            orderData: response,
            orderNo,
            from: "basket"
          }
        });
      });
    }
  },
  computed: {
    ...mapGetters({
      GET_SUBTOTAL: "basket/GET_SUBTOTAL",
      GET_ORDERS: "orders/GET_ORDERS",
      GET_ITEMS_LENGTH: "basket/GET_ITEMS_LENGTH",
      user: "accounts/user"
    }),
    showBadge() {
      return this.GET_ITEMS_LENGTH > 0 ? true : false;
    }
  },
  filters: {
    status(val) {
      return val.toUpperCase();
    }
  },
  components: {
    "mt-spinner": Spinner,
    BottomNav
  },
  mixins: [date, mixins]
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

.basket-table td {
  padding: 8px;
}

.top-underline {
  text-decoration: overline;
  color: #1976d2;
}

.spinner-position {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
