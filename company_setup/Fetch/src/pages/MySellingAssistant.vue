<template>
  <div>
    <v-toolbar app color="primary" dark>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <ContactsBadge />
      <Accounts />
    </v-toolbar>

    <v-container v-if="inventoryDisabled">
      <v-layout row align-center justify-center>
        <v-flex xs10>
          <div class="font-weight-bold">Coming soon...</div>
        </v-flex>
      </v-layout>

      <v-dialog v-model="showDialog" persistent width="90vw">
        <v-card>
          <v-card-title class="primary white--text title font-weight-bold">Coming Soon!</v-card-title>
          <v-card-text>Organizer page will be available soon. So watch out!</v-card-text>
          <v-card-actions class="mt-3 px-3">
            <v-btn color="primary" dark block @click="goBack">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
    
    <v-container v-else>
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
import ContactsBadge from "@/components/ContactsBadge";

export default {
  mixins: [mixins],
  data: () => ({
    inventoryDisabled: true,
    showDialog: false,

  }),
  created() {
    this.cordovaBackButton(this.goBack);
    this.showDialog = true;
  },
  methods: {
    goBack() {
      // this.$router.push({ name: "Tabs", params: { tab: "more" } });
      this.$router.go(-1);
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
    BottomNav,
    ContactsBadge
  }
};
</script>

<style scoped>
.responsive {
  width: 100%;
  height: auto;
}
</style>

