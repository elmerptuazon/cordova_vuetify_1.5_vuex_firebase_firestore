<template>
  <div>
    <v-btn
      icon
      @click="goToBasket"
      v-show="$store.getters['accounts/isApproved']"
      v-if="user.type === 'Reseller'"
    >
      <v-badge right color="red lighten-1" overlap v-model="showBasketCount">
        <span slot="badge">{{ basketCount }}</span>
        <v-icon>shopping_cart</v-icon>
      </v-badge>
    </v-btn>
    <v-btn
      icon
      @click="goToBasket"
      v-show="$store.getters['accounts/isApproved']"
      v-else-if="user.type === 'Customer'"
    >
      <v-badge right color="red" overlap v-model="showBadge">
        <span slot="badge">{{ GET_ITEMS_LENGTH }}</span>
        <v-icon>shopping_cart</v-icon>
      </v-badge>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["tabName"],
  methods: {
    goToBasket() {
      const previousTab = this.tabName ? this.tabName : null;
      this.$router.push({
        name: this.user.type === "Reseller" ? "NewStockOrder" : "Basket",
        params: {
          previousRoute: this.$router.history.current.name,
          previousTab,
          route: this.$route
        }
      });
    }
  },
  computed: {
    ...mapGetters({
      GET_SUBTOTAL: "basket/GET_SUBTOTAL",
      GET_ITEMS_LENGTH: "basket/GET_ITEMS_LENGTH",
      user: "accounts/user"
    }),
    showBadge() {
      return this.GET_ITEMS_LENGTH > 0 ? true : false;
    },
    showBtn() {
      const user = this.user;

      if (user.type === "Reseller" && user.status === "pending") {
        return false;
      } else if (user.type === "Reseller" && user.status === "denied") {
        return false;
      } else {
        return true;
      }
    },
    basketCount() {
      return this.$store.state.stock_orders.basket;
    },
    showBasketCount() {
      return this.basketCount > 0 ? true : false;
    }
  }
};
</script>