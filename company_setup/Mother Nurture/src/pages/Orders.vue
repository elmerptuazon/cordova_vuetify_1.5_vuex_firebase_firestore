<template>
  <div>
    <v-toolbar app fixed color="primary" dark :extended="extended">
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
      <v-btn icon @click="goToBasket" v-if="user.type === 'Customer'">
        <v-badge right color="red" overlap v-model="showBadge">
          <span slot="badge">{{ GET_ITEMS_LENGTH }}</span>
          <v-icon>shopping_cart</v-icon>
        </v-badge>
      </v-btn>
      <BasketBadge v-if="user.type === 'Reseller'" />
      <v-btn icon @click="extended = !extended">
        <v-icon v-if="!extended">search</v-icon>
        <v-icon v-else>close</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-tabs
      grow
      v-model="tab"
      height="60"
      slider-color="white"
      @change="change"
    >
      <v-tab
        :class="[tab !== 'tab1' ? 'grey lighten-2' : '']"
        :transition="false"
        href="#tab1"
        >My Customer <br />
        Orders</v-tab
      >
      <v-tab
        :class="[tab !== 'tab2' ? 'grey lighten-2' : '']"
        :transition="false"
        href="#tab2"
        >My Orders to <br />{{ $store.getters["GET_COMPANY"] }}</v-tab
      >
    </v-tabs>

    <div
      v-if="tab === 'tab1'"
      class="tab-content white"
      :style="{ height: height + 'px' }"
    >
      <div class="py-2">
        <CustomerOrders :items="items" :search="search" ref="CustomerOrders" />
      </div>
    </div>

    <div
      v-else-if="tab === 'tab2'"
      class="tab-content white"
      :style="{ height: height + 'px' }"
    >
      <div class="py-2">
        <OrdersToEverBilena
          :items="items"
          :search="search"
          ref="OrdersToEverBilena"
        />
      </div>
    </div>

    <BottomNav currentTab="orders" />
  </div>
</template>

<script>
import { date } from "@/mixins/date";
import { mixins } from "@/mixins";
import { mapGetters } from "vuex";
import { Spinner } from "mint-ui";
import BasketBadge from "@/components/BasketBadge";
import MaleDefaultImage from "@/assets/img/male-default.jpg";
import FemaleDefaultImage from "@/assets/img/female-default.jpg";
import { AUTH } from "@/config/firebaseInit";
import CustomerOrders from "@/components/CustomerOrders";
import OrdersToEverBilena from "@/components/OrdersToEverBilena";

export default {
  data: () => ({
    extended: false,
    search: null,
    loader: false,
    tab: "tab1",
    items: [],
    height: null
  }),
  created() {
    if (this.$route.query.hasOwnProperty("tab")) {
      this.tab = "tab2";
      this.change("tab2");
    } else {
      this.change("tab1");
    }

    this.$nextTick(() => {
      this.height = window.innerHeight - (56 + 56);
    });
  },
  beforeDestroy() {
    delete this.$route.params.from;
  },
  methods: {
    async change(page) {
      this.items.length = 0;
      if (page === "tab1") {
        this.showLoading("CustomerOrders");
        const orders = (await this.$store.dispatch(
          "orders/GET_ORDERS_RESELLER_VIEW"
        )).map(order => {
          if (order.status === "placed") {
            order.position = 2;
          } else if (order.status === "in progress") {
            order.position = 3;
          } else if (order.status === "delivered") {
            order.position = 4;
          }
          order.id = order.orderNo;
          return order;
        });
        const basket = this.getOrdersFromOfflineContacts();
        this.items = [...orders, ...basket];
        console.log(this.items);
        this.$refs.CustomerOrders.loading = false;
      } else {
        this.showLoading("OrdersToEverBilena");
        const response = await this.$store.dispatch("stock_orders/FIND_ALL");
        this.items = response.data.map(data => {
          data.total = data.items.reduce((a, b) => a + b.resellerTotal, 0);
          data.discountedTotal = this.applyDiscount(data.total);
          if (!data.hasOwnProperty("shipmentsToReceive")) {
            data.shipmentsToReceive = 0;
          }
          return data;
        });

        // for (let i = 0; i < this.items.length; i++) {
        //   let item = this.items[i];
        //   await this.$store.dispatch("shipment/GetShipments", item.id);
        //   this.items[i].shipmentCount = this.$store.getters[
        //     "shipment/GET_RECEIVABLE_SHIPMENT_COUNT"
        //   ];
        // }

        console.log(this.items);
        this.$refs["OrdersToEverBilena"].loading = false;
      }
    },

    getOrdersFromOfflineContacts() {
      // GET ALL OFFLINE CONTACTS
      let offlineContacts = JSON.parse(
        localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
      );
      if (!offlineContacts) return;
      // GET OFFLINE CONTACTS WITH BASKET
      offlineContacts = offlineContacts.map(contact => {
        const totalPrice = contact.basket.items.reduce((a, b) => {
          const total = b.attribute.qty * b.product.price;
          return +a + +total;
        }, 0);
        contact.basket.totalPrice = totalPrice;
        return contact;
      });

      offlineContacts = offlineContacts.filter(
        contact => contact.basket.items.length > 0
      );
      offlineContacts.forEach(contact => {
        if (!document.URL.includes("http")) {
          contact.imageObj.src = contact.imageObj.src.replace("/static/", "");
        }
      });

      return offlineContacts.map(contact => {
        return {
          contact: contact,
          id: contact.basket.basketId,
          total: contact.basket.totalPrice,
          status: "On Cart",
          created_at: null,
          position: 1
        };
      });
    },

    applyDiscount(total) {
      let discount;
      // if (total >= 1500 && total <= 2999) {
      // 	discount = 10;
      // } else if (total >= 3000 && total <= 4999) {
      // 	discount = 15;
      // } else if (total >= 5000 && total <= 9999) {
      // 	discount = 18;
      // } else if (total >= 10000 && total <= 24999) {
      // 	discount = 20;
      // } else {
      // 	discount = null;
      // }

      if (discount) {
        return total - (discount / 100) * total;
      } else {
        return total;
      }
    },

    showLoading(ref) {
      this.$nextTick(() => {
        this.$refs[ref].loading = true;
      });
    }
  },
  computed: {
    ...mapGetters({
      GET_ITEMS_LENGTH: "basket/GET_ITEMS_LENGTH",
      user: "accounts/user"
    }),
    showBadge() {
      return this.GET_ITEMS_LENGTH > 0 ? true : false;
    },
    allOrders() {
      return this.orderItems;
    },
    maleDefaultImage() {
      return MaleDefaultImage;
    },
    femaleDefaultImage() {
      return FemaleDefaultImage;
    }
  },
  components: {
    BasketBadge,
    CustomerOrders,
    OrdersToEverBilena
  },
  mixins: [date, mixins],

  watch: {
    extended(val) {
      if (val) {
        this.height = window.innerHeight - (112 + 56);
      } else {
        this.height = window.innerHeight - (56 + 56);
      }
    }
  }
};
</script>

<style scoped>
.tab-content {
  width: 100%;
  position: fixed;
  overflow-y: scroll;
}

.content-height {
  height: 476px;
}

.content-height-extended {
  height: 420px;
}
</style>