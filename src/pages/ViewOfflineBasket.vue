<template>
  <div>
    <v-toolbar app color="primary" dark :extended="extended">
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">
        <v-avatar size="25px">
          <img v-lazy="offlineUser.imageObj" />
        </v-avatar>
        &nbsp; {{ offlineUser.firstName }}'s Basket
      </v-toolbar-title>
      <v-text-field
        label="Search basket..."
        clearable
        v-if="extended"
        slot="extension"
        class="mx-3"
        flat
        solo-inverted
        prepend-icon="search"
        v-model="search"
      ></v-text-field>
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
              <th
                class="border-bottom text-xs-right header-size grey--text text--darken-1"
              >
                NAME
              </th>
              <th
                class="border-bottom text-xs-right header-size grey--text text--darken-1"
              >
                CLR
              </th>
              <th
                class="border-bottom text-xs-right header-size grey--text text--darken-1"
              >
                SZ
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
                orderBy(offlineUser.basket.items, 'created_at', -1),
                search
              )"
              :key="i"
            >
              <td class="border-bottom">
                <v-layout row>
                  <v-flex xs4 class="text-xs-left">
                    <v-avatar tile size="40px">
                      <v-img
                        size="40"
                        contain
                        :src="item.product.imageObj"
                        :alt="item.product.name"
                      ></v-img>
                    </v-avatar>
                  </v-flex>
                  <v-flex xs8 class="mt-2 text-xs-right">
                    <span v-html="item.product.name" class="caption"></span>
                  </v-flex>
                </v-layout>
              </td>
              <td class="text-xs-right border-bottom">
                <!-- <v-icon class="body-1" :color="`${item.attribute.color.toLowerCase()}`" v-if="item.attribute.color">fiber_manual_record</v-icon> -->
                <span v-if="item.attribute.color">{{
                  item.attribute.color
                }}</span>
              </td>
              <td class="caption text-xs-right border-bottom">
                {{ item.attribute.size }}
              </td>
              <td class="caption text-xs-right border-bottom">
                {{ item.attribute.qty }}
              </td>
              <td class="caption text-xs-right border-bottom">
                {{ (item.attribute.qty * item.product.price) | currency("P") }}
                <br />
                <a @click="editItem(item, i)">
                  <v-icon class="caption blue--text">border_color</v-icon>
                  Edit</a
                >
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
                {{ GET_SUBTOTAL | currency("P") }}
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
        <div
          class="text-xs-center mt-3"
          v-show="offlineUser.basket.items.length > 0"
        >
          <v-btn
            @click="goToCheckout"
            depressed
            large
            color="primary"
            class="white--text"
            >Place Order for {{ offlineUser.firstName }}</v-btn
          >
        </div>
      </div>
    </v-container>
    <v-dialog v-model="editItemDialog" persistent>
      <v-card>
        <v-card-title class="pa-0">
          <v-btn icon @click="cancelEdit" class="primary--text">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="deleteItem" color="pink" depressed dark small
            >Delete</v-btn
          >
        </v-card-title>
        <v-card-text v-if="selected.product && selected.attribute">
          <div class="text-xs-center">
            <v-avatar tile size="70px">
              <img
                v-lazy="selected.product.imageObj"
                :alt="selected.product.name"
              />
            </v-avatar>
            <div class="title">{{ selected.product.name }}</div>
          </div>
          <v-container fluid>
            <v-layout row wrap v-if="!selected.product.attributes">
              <v-flex xs12>
                <v-select
                  :items="[1, 2, 3, 4, 5, 6, 7]"
                  required
                  :rules="basicRules"
                  label="Quantity"
                  v-model="attribute.qty"
                  single-line
                  menu-props="bottom"
                ></v-select>
              </v-flex>
              <v-flex xs12>
                <v-select
                  :items="['50ml', '100ml', '150ml', '200ml']"
                  required
                  :rules="basicRules"
                  v-model="attribute.size"
                  label="Size"
                  single-line
                  menu-props="bottom"
                ></v-select>
              </v-flex>
              <v-flex xs12>
                <v-select
                  label="Color"
                  :items="['Red', 'Blue', 'Yellow', 'Green']"
                  max-height="auto"
                  v-model="attribute.color"
                  required
                  :rules="basicRules"
                >
                  <template slot="item" slot-scope="data">
                    <v-list-tile-action>
                      <v-icon :color="`${data.item.toLowerCase()}`"
                        >fiber_manual_record</v-icon
                      >
                    </v-list-tile-action>
                    <v-list-tile-content>
                      <v-list-tile-title v-html="data.item"></v-list-tile-title>
                    </v-list-tile-content>
                  </template>
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-else>
              <v-flex
                xs12
                v-for="(a, index) in selected.product.attributes"
                :key="index"
              >
                <v-select
                  v-if="a.name == 'Color'"
                  label="Color"
                  :items="a.items"
                  max-height="auto"
                  v-model="attribute.color"
                  required
                  :rules="basicRules"
                >
                  <template slot="item" slot-scope="data">
                    <v-list-tile-action>
                      <v-icon :color="`${data.item.toLowerCase()}`"
                        >fiber_manual_record</v-icon
                      >
                    </v-list-tile-action>
                    <v-list-tile-content>
                      <v-list-tile-title v-html="data.item"></v-list-tile-title>
                    </v-list-tile-content>
                  </template>
                </v-select>

                <v-select
                  v-else
                  :items="a.items"
                  required
                  :rules="basicRules"
                  v-model="attribute[a.name.toLowerCase()]"
                  :label="a.name"
                  single-line
                  menu-props="bottom"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-container>
          <div>
            <v-btn block depressed color="primary" @click="update"
              >Update</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <ConfirmationModal
      ref="ConfirmationModal"
      @confirmClicked="finalizeOrder"
    />
    <v-snackbar v-model="basketSnackbar" menu-props="bottom">
      {{ basketSnackbarMsg }}
    </v-snackbar>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { mixins } from '@/mixins';
import { AUTH } from '@/config/firebaseInit';
import ConfirmationModal from '@/components/ConfirmationModal';

export default {
	data: () => ({
		extended: false,
		search: null,
		editItemDialog: false,
		confirm: false,
		selected: {},
		basketSnackbar: false,
		basketSnackbarMsg: null,
		offlineUser: {},
		currentIndex: null,
		attribute: {}
	}),
	created() {
		this.offlineUser = Object.assign({}, this.$route.params.basket)
		this.disableBackButton()
	},
	methods: {
		notify (msg) {
			this.basketSnackbar = true
			this.basketSnackbarMsg = msg
		},
		goBack () {
			if (this.$route.query.fromOrders) {
				this.$router.push({name: 'Orders'});
			} else {
				this.$router.push({name: 'ViewContact', params: { id: this.offlineUser.id, user: this.offlineUser }})
			}
		},
		goToCheckout () {

			this.$refs.ConfirmationModal.show('Confirm', 'Are you sure you want to place the order for '+ this.offlineUser.firstName+'?' );
		},
		finalizeOrder (){
			this.disableButton = true;
			this.$store.dispatch('orders/PLACE_OFFLINE_ORDER', this.offlineUser)
			.then((res) => {
			
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
		},
		editItem (item, index) {
			this.$store.dispatch('products/GET_PRODUCT', item.product.id)
			.then((res) => {
		   		 // open dialog
		   		 this.editItemDialog = true
			   // store to localstorage so that we can reset values if cancelled
			   this.currentIndex = index
			   localStorage.setItem('selected_basket_item', JSON.stringify(item))
			   // set dialog values
			   this.selected = Object.assign({}, item)

			   this.selected.product = Object.assign({}, this.selected.product, res);
			   if (this.selected.product.attributes) {
			   	this.selected.product.attributes.forEach((attrib) => {
			   		const attribName = attrib.name.toLowerCase();
			   		if (attribName === 'quantity') {
			   			this.attribute['quantity'] = +item.attribute['qty'];
			   		} else {
			   			this.attribute[attribName] = item.attribute[attribName];
			   		}
			   	})
			   } else {
			   	this.attribute = {
			   		qty: item.attribute.qty,
			   		size: item.attribute.size,
			   		color: item.attribute.color
			   	}
			   }
			   console.log(this.attribute)
			})
		},
		cancelEdit () {
			this.editItemDialog = false
			const i = this.offlineUser.basket.items.findIndex((item, index) => index === this.currentIndex)
			this.offlineUser.basket.items[i] = Object.assign({}, JSON.parse(localStorage.getItem('selected_basket_item')))
			this.selected = {}
		},
		update () {
			const offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));
			const userIndex = offlineContacts.findIndex((contact) => contact.id === this.offlineUser.id);
			offlineContacts[userIndex] = Object.assign({}, this.offlineUser);
			const attributeClone = JSON.parse(JSON.stringify(this.attribute));
			attributeClone.qty = attributeClone.quantity ? attributeClone.quantity : attributeClone.qty;
			delete attributeClone.quantity;
			offlineContacts[userIndex].basket.items[this.currentIndex].attribute = attributeClone;
			localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify(offlineContacts))
			setTimeout(() => {
				this.selected = {}
				this.editItemDialog = false
				this.notify('Item has been updated')
				localStorage.removeItem('selected_basket_item')
			}, 250)
		},
		deleteItem () {
			const offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`))
			const userIndex = offlineContacts.findIndex((contact) => contact.id === this.offlineUser.id)
			const basketItems = this.offlineUser.basket.items
			basketItems.splice(this.currentIndex, 1)
			offlineContacts[userIndex] = Object.assign({}, this.offlineUser)
			localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify(offlineContacts))
			setTimeout(() => {
				this.selected = {}
				this.editItemDialog = false
				this.notify('Item has been removed')
				localStorage.removeItem('selected_basket_item')
			}, 250)
		}
	},
	watch: {
		GET_ITEMS (val) {
			if (val.length < 1) this.$router.push({name: 'Tabs', params: {tab: 'basket'}})
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
	mixins: [mixins],
	components: {
		ConfirmationModal
	}
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
  border-bottom: 1px solid #1976d2;
}

.header-size {
  font-size: 10px;
}
</style>
