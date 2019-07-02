<template>
  <div>

    <v-toolbar app color="primary" dark v-if="$store.state.rightAlignToolbarIcons">
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <Logo />
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">Sales Performance</v-toolbar-title>
      <BasketBadge tabName="msa" />
    </v-toolbar>

    <v-toolbar app color="primary" dark v-else>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">Sales Performance</v-toolbar-title>
      <v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Logo />
    </v-toolbar>

    <v-container>
      <div class="mt-4"></div>
      <v-layout row wrap>
        <v-flex xs12>
          <img :src="salesSummary" alt="calendar" class="responsive" @click="goTo('SalesPerformanceSummary')">
        </v-flex>
        <v-flex xs12>
          <img :src="customers" alt="inventory" class="responsive" @click="goTo('Customers')">
        </v-flex>
        <v-flex xs12 >
          <img :src="products" alt="salesp" class="responsive" @click="goTo('Products')">
        </v-flex>
      </v-layout>
    </v-container>
    <BottomNav currentTab="msa" />
  </div>
</template>




<script>
  import {
    mapGetters
  } from 'vuex'
  import {
    mixins
  } from '@/mixins'
  import { Spinner } from 'mint-ui'
  import BasketBadge from '@/components/BasketBadge'
  import SalesSummary from '@/assets/msa/msa-sales.png'
  import Customers from '@/assets/msa/msa-customer.png'
  import Products from '@/assets/msa/msa-products.png'
  export default {
    mixins: [mixins],
    data: () => ({
    }),
    created () {
      this.cordovaBackButton(this.goBack);
    },
    methods: {
      goBack () {
        this.$router.push({name: 'MySellingAssistant'});
      },
      goTo (page) {
        if (page.toLowerCase() === 'products') {
          this.$router.push({name: 'MSAProducts'});
          return;
        }
        this.$router.push({name: page})
      }
    },
    computed: {
      ...mapGetters({
        'GET_LIST': 'catalogues/GET_LIST',
        'GET_ITEMS': 'basket/GET_ITEMS'
      }),
      salesSummary: () => SalesSummary,
      customers: () => Customers,
      products: () => Products
    },
    components: {
      'mt-spinner': Spinner,
      BasketBadge
    }
  }

</script>

<style scoped>
.responsive {
    width: 100%;
    height: auto;
}
</style>

