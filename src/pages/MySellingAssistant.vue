<template>
  <div>
    <v-toolbar app color="primary" dark>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container>
      <div class="mt-4"></div>
      <v-layout row wrap>
        <v-flex xs12>
          <img
            :src="paymentImage"
            alt="payment"
            class="responsive"
            @click="goTo('Payments')"
          />
        </v-flex>
        <v-flex xs12>
          <img
            :src="calendarImage"
            alt="calendar"
            class="responsive"
            @click="goTo('Calendar')"
          />
        </v-flex>
        <!-- <v-flex xs12>
          <img :src="inventoryImage" alt="inventory" class="responsive" @click="goTo('InventoryPages')">
        </v-flex> -->
        <v-flex xs12>
          <img
            :src="inventoryImage"
            alt="inventory"
            class="responsive"
            @click="goTo('Inventory')"
          />
        </v-flex>
        <v-flex xs12>
          <img
            :src="salesImage"
            alt="salesp"
            class="responsive"
            @click="goTo('SalesPerformance')"
          />
        </v-flex>
        <!-- <v-flex xs12>
          <img :src="customersImage" alt="contacts" class="responsive" @click="goTo('Contacts')">
        </v-flex> -->
      </v-layout>
    </v-container>
    <BottomNav currentTab="msa" />
  </div>
</template>




<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import { Spinner } from "mint-ui";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
import PaymentImage from "@/assets/msa/msa-payment.png";
import CalendarImage from "@/assets/msa/msa-calendar.png";
import InventoryImage from "@/assets/msa/msa-inventory.png";
import SalesImage from "@/assets/msa/msa-salesp.png";
import Customers from "@/assets/msa/customers.png";
export default {
  mixins: [mixins],
  data: () => ({}),
  created() {
    this.cordovaBackButton(this.goBack);
  },
  methods: {
    goBack() {
      this.$router.push({ name: "Tabs", params: { tab: "more" } });
    },
    goTo(page) {
      this.$router.push({ name: page });
    }
  },
  computed: {
    ...mapGetters({
      GET_LIST: "catalogues/GET_LIST",
      GET_ITEMS: "basket/GET_ITEMS"
    }),
    paymentImage: () => PaymentImage,
    calendarImage: () => CalendarImage,
    inventoryImage: () => InventoryImage,
    salesImage: () => SalesImage,
    customersImage: () => Customers
  },
  components: {
    "mt-spinner": Spinner,
    BasketBadge,
    BottomNav
  }
};
</script>

<style scoped>
.responsive {
  width: 100%;
  height: auto;
}
</style>

