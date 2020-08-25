<template>
  <v-container class="pa-0 pt-2 ma-0" grid-list-xs fluid>
    <v-data-table
      :headers="headers"
      :items="items"
      hide-actions
      :pagination.sync="pagination"
      :loading="loading"
      :search="search"
    >
      <template slot="headers" slot-scope="props">
        <tr>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :class="[
              'column sortable',
              pagination.descending ? 'desc' : 'asc',
              header.value === pagination.sortBy ? 'active' : ''
            ]"
            @click="changeSort(header.value)"
            style="padding: 0;"
          >
            <v-icon small>arrow_upward</v-icon>
            <span v-html="header.text" v-if="header.text"></span>
            <span v-else><div style="width: 170px;"></div></span>
          </th>
        </tr>
      </template>
      <template slot="items" slot-scope="props">
        <tr
          @click="viewOrder(props.item)"
          :class="[props.item.read === false ? 'blue lighten-4' : '']"
        >
          <td class="text-xs-left" style="padding-left: 5px; padding-right: 5px;">
            <div v-if="props.item.status === 'On Cart'">
              <!-- for offline customers basket -->
              <v-layout row wrap>
                <!-- <v-flex xs4 style="vertical-align: middle">
                  <div class="text-xs-center" style="display:table-cell; vertical-align: middle;">
                    <v-avatar size="35px" tile v-if="props.item.contact.displayPicture">
                      <v-img contain :src="props.item.contact.displayPicture"></v-img>
                    </v-avatar>
                    <v-avatar size="35px" tile v-else>
                      <v-img contain v-if="props.item.contact.gender === 'Male'" :src="malePlacecholder"></v-img>
                      <v-img contain v-else :src="femalePlaceholder"></v-img>
                    </v-avatar>
                  </div>
                </v-flex> -->
                <v-flex xs12>
                  <span class="body-1 font-weight-medium wordwrap">
                    {{ props.item.contact.firstName }}
                    {{ props.item.contact.lastName }}
                  </span>
                  <br />
                  <span class="caption">Order</span>
                </v-flex>
              </v-layout>
              <!-- for offline customers basket -->
            </div>
            <div v-else>
              <!-- for online customers and placed baskets -->
              <v-layout row wrap v-if="props.item.offlineContact">
                <!-- <v-flex xs4 style="vertical-align: middle">
                  <div class="text-xs-center" style="display:table-cell; vertical-align: middle;">
                    <v-avatar size="35px" tile v-if="props.item.offlineContact.displayPicture">
                      <v-img contain :src="props.item.offlineContact.displayPicture"></v-img>
                    </v-avatar>
                    <v-avatar size="35px" tile v-else>
                      <v-img contain v-if="props.item.offlineContact.gender === 'Male'" :src="malePlacecholder"></v-img>
                      <v-img contain v-else :src="femalePlaceholder"></v-img>
                    </v-avatar>
                  </div>
                </v-flex> -->
                <v-flex xs12>
                  <span class="body-1 font-weight-medium wordwrap">
                    {{ props.item.offlineContact.firstName }}
                    {{ props.item.offlineContact.lastName }}
                  </span>
                  <br />
                  <span class="caption">Order {{ props.item.id }}</span>
                </v-flex>
              </v-layout>
              <!-- for online customers and placed baskets -->
            </div>
          </td>
          <td
            class="text-xs-center"
            style="padding-left: 5px; padding-right: 5px;"
          >
            <span v-if="props.item.status === 'On Cart'"></span>
            <span v-else>{{
              props.item.created_at | momentify("D MMM YYYY")
            }}</span>
          </td>
          <td
            class="text-xs-center"
            style="padding-left: 5px; padding-right: 5px;"
          >
            {{ props.item.status | uppercase }}
          </td>
          <td
            class="text-xs-center"
            style="padding-left: 5px; padding-right: 5px;"
          >
            {{ props.item.total | currency("P") }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import MaleDefaultImage from '@/assets/img/male-default.jpg';
import FemaleDefaultImage from '@/assets/img/female-default.jpg';
import { date } from '@/mixins/date';
import { AUTH } from "@/config/firebaseInit";

export default {
	mixins: [date],

  props: ['search'],

  data: () => ({
    pagination: {
      sortBy: 'created_at',
      descending: true,
      rowsPerPage: -1
    },

    loading: false,

    headers: [
      {
        text: '',
        value: 'id',
        sortable: false,
        align: 'left'
      },
      {
        text: 'Date Placed',
        value: 'created_at',
        align: 'left'
      },
      {
        text: 'Status',
        value: 'position',
        align: 'left'
      },
      {
        text: 'Cost',
        value: 'total',
        align: 'left'
      }
    ],

    offlineCustomerOrders: [],
    offsetTop: 0,
  }),

  async created() {
    this.loading = true;
    this.offlineCustomerOrders = await this.getOrdersFromOfflineContacts();
    this.loading = false;
  },

  methods: {
    async viewOrder(item) {
      console.log(item);
      this.loading = true;

      if (item.status === 'On Cart' || item.status === 'on cart') {
        this.$router.push({
          name: 'ViewOfflineBasket',
          params: {
            basket: item.contact
          },
          query: {
            fromOrders: true
          }
        });
      } else {
        await this.$store.dispatch('orders/UPDATE_ORDER', {
          orderNo: item.id,
          object: { read: true },
        });

        item.read = true;
        this.$router.push({
          name: 'PlacedOrder',
          params: {
            order: item
          },
          query: {
            fromOrders: true
          }
        });
      }
      this.loading = false;
    },

		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending;
			} else {
				this.pagination.sortBy = column;
				this.pagination.descending = false;
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
    onScroll (e) {
		this.offsetTop = e.target.scrollTop
		},
	},

	computed: {
    onlineCustomerOrders() {
      return this.$store.getters['orders/GET_CUSTOMER_ORDERS'];
    },

    items() {
      return [...this.onlineCustomerOrders, ...this.offlineCustomerOrders];
    },

		malePlacecholder () {
			return MaleDefaultImage;
		},

		femalePlaceholder () {
			return FemaleDefaultImage;
		}
	}
}
</script>

<style scoped>
</style>
