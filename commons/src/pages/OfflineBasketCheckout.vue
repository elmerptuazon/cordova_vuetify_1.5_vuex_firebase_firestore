<template>
  <div>
    <v-toolbar app color="primary" dark :extended="extended">
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">
        <v-avatar size="25px">
          <img v-lazy="offlineUser.imageObj">
        </v-avatar> &nbsp; {{offlineUser.firstName}}'s Checkout
      </v-toolbar-title>
      <v-text-field label="Search basket..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted prepend-icon="search"
      v-model="search"></v-text-field>
      <v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
      <v-btn icon @click="extended = !extended">
        <v-icon v-if="!extended">search</v-icon>
        <v-icon v-else>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-container class="pa-0 pt-2 ma-0" grid-list-xs fluid>
      <div>
        <table class="basket-table">
          <thead>
            <tr>
              <th class="border-bottom text-xs-right header-size grey--text text--darken-1">NAME</th>
              <th class="border-bottom text-xs-right header-size grey--text text--darken-1">CLR</th>
              <th class="border-bottom text-xs-right header-size grey--text text--darken-1">SZ</th>
              <th class="border-bottom text-xs-right header-size grey--text text--darken-1">QTY</th>
              <th class="border-bottom text-xs-right header-size grey--text text--darken-1">COST</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in filterBy(orderBy(offlineUser.basket.items, 'created_at', -1), search)" :key="i">
              <td class="border-bottom">
                <v-layout row>
                  <v-flex xs4 class="text-xs-left">
                    <v-avatar tile size="40px">
                      <img v-lazy="item.product.imageObj" :alt="item.product.name">
                    </v-avatar>
                  </v-flex>
                  <v-flex xs8 class="mt-2 text-xs-right">
                    <span v-html="item.product.name" class="caption"></span>
                  </v-flex>
                </v-layout>

              </td>
              <td class="text-xs-right border-bottom">
                <!-- <v-icon class="body-1" :color="`${item.attribute.color.toLowerCase()}`" v-if="item.attribute.color">fiber_manual_record</v-icon> -->
                <span v-if="item.attribute.color">{{ item.attribute.color }}</span>
              </td>
              <td class="caption text-xs-right border-bottom">{{ item.attribute.size }}</td>
              <td class="caption text-xs-right border-bottom">{{ item.attribute.qty }}</td>
              <td class="caption text-xs-right border-bottom">
                {{ item.attribute.qty * item.product.price | currency('P') }}
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td class="caption text-xs-right">
                Total
              </td>
              <td class="caption text-xs-right">
                {{GET_SUBTOTAL | currency('P')}}
              </td>
            </tr>
            <!-- <tr>
              <td></td>
              <td></td>
              <td></td>
              <td class="caption text-xs-right">
                Discount
              </td>
              <td class="caption text-xs-right">

              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td class="border-bottom"></td>
              <td class="border-bottom"></td>
              <td class="border-bottom"></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td class="caption text-xs-right">
                Total
              </td>
              <td class="caption text-xs-right">
                {{GET_SUBTOTAL | currency('P')}}
              </td>
            </tr> -->
          </tbody>
        </table>
        <div class="text-xs-center mt-3">
          <v-btn @click="placeOrder" depressed large color="primary" class="white--text" :loading="disableCheckoutButton" :disabled="disableCheckoutButton">
            <v-icon left>check_circle</v-icon> Place Order for {{offlineUser.firstName}}</v-btn>
          </div>
        </div>
      </v-container>
    </div>
  </template>





  <script>
  import {
    mapGetters
  } from 'vuex'
  import {
    mixins
  } from '@/mixins'
  import { AUTH } from '@/config/firebaseInit';
  export default {
    data: () => ({
      extended: false,
      search: null,
      disableCheckoutButton: false,
      offlineUser: {}
    }),
    created() {
      this.offlineUser = Object.assign({}, this.$route.params.basket)
      this.disableBackButton()
    },
    methods: {
      goBack() {
        this.$router.push({name: 'ViewOfflineBasket', params: {basket: this.$route.params.basket}})
      },
      placeOrder () {
        this.disableCheckoutButton = true
        this.$store.dispatch('orders/PLACE_OFFLINE_ORDER', this.offlineUser)
        .then((res) => {
          this.disableCheckoutButton = false
          const offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`))
          const i = offlineContacts.findIndex((c) => c.id === this.offlineUser.id)
          if (i >= 0) {
            offlineContacts[i].basket = {
              items: [],
              orderStatus: 'Basket',
              totalPrice: 0
            }
            localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify(offlineContacts))
          }
          this.$router.push({
            name: 'CheckoutSuccess',
            params: {
              orderDetails: res,
              forOfflineContact: {
                firstName: this.offlineUser.firstName,
                middleName: this.offlineUser.middleName,
                lastName: this.offlineUser.lastName
              }
            }
          })
        })
      }
    },
    computed: {
      GET_SUBTOTAL () {
        return this.offlineUser.basket.items.reduce((a, b) => {
          const total = b.attribute.qty * b.product.price
          return +a + +total
        }, 0)
      }
    },
    mixins: [mixins]
  }

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

  .basket-table tr:hover {
    background-color: #ddd;
  }

  .basket-table td.border-bottom {
    border-bottom: 1px solid #ddd;
  }

  .basket-table th.border-bottom {
    border-bottom: 1px solid #1976D2;
  }

  .header-size {
    font-size: 10px;
  }

  </style>
