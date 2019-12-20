<template>
  <div>

    <v-toolbar app color="primary" dark v-if="$store.state.rightAlignToolbarIcons">
      <v-btn icon @click="goBack()">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <Accounts />
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">Inventory</v-toolbar-title>
      <v-spacer></v-spacer>
      <BasketBadge tabName="msa" />
    </v-toolbar>

    <v-toolbar app color="primary" dark v-else>
      <v-btn icon @click="goBack()">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">Inventory</v-toolbar-title>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container>
      <div class="mt-4"></div>
      <v-layout row wrap>
        <v-flex xs12>
          <img :src="inventoryImage" alt="inventory" class="responsive" @click="goTo('Inventory')">
        </v-flex>
        <v-flex xs12>
          <img :src="previousStockOrders" alt="salesp" class="responsive" @click="goTo('StockOrders')">
        </v-flex>
        <v-flex xs12>
          <img :src="currentStockOrders" alt="salesp" class="responsive" @click="goTo('NewStockOrder')">
        </v-flex>
      </v-layout>
    </v-container>
    <BottomNav currentTab="msa" />
  </div>
</template>




<script>
  import {mapGetters} from 'vuex';
  import {mixins} from '@/mixins';
  import { Spinner } from 'mint-ui'
  import BottomNav from '@/components/BottomNav'
  import BasketBadge from '@/components/BasketBadge'
  import InventoryImage from '@/assets/msa/msa-inventory.png'
  export default {
    mixins: [mixins],
    data: () => ({
    }),
    created () {
      this.cordovaBackButton(this.goBack);
    },
    methods: {
      goBack () {
        this.$router.push({name: 'MySellingAssistant'})
      },
      goTo (page) {
        this.$router.push({name: page})
      }
    },
    computed: {
      paymentImage: () => PaymentImage,
      calendarImage: () => CalendarImage,
      inventoryImage: () => InventoryImage,
      currentStockOrders: () => CurrentStockOrders,
      previousStockOrders: () => PreviousStockOrders
    },
    components: {
      'mt-spinner': Spinner,
      BasketBadge,
      BottomNav
    }
  }

</script>

<style scoped>
.responsive {
    width: 100%;
    height: auto;
}
</style>
