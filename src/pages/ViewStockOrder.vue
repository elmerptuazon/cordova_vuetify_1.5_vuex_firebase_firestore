<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<BasketBadge tabName="msa" />
			<v-spacer></v-spacer>
			<Accounts />
		</v-toolbar>

		<table class="basket-table">
					<thead>
						<tr>
							<th class="border-bottom header-size grey--text text--darken-1">NAME</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">QTY</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">COST</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, i) in filterBy(orderBy(stockOrder.items, 'created_at', -1), search)" :key="i">
							<td class="border-bottom">
								<v-layout row>
									<v-flex xs3>
										<v-avatar tile size="40px">
											<v-img :src="item.image" :alt="item.name" contain></v-img>
										</v-avatar>
									</v-flex>
									<v-flex xs9>
										<span v-html="item.name" class="caption"></span>
										<br />
										<span class="caption">
											{{item.attributes | joinAttributes}}
										</span>
									</v-flex>
								</v-layout>

							</td>
							<td class="caption text-xs-right border-bottom">{{ item.qty }}</td>
							<td class="caption text-xs-right border-bottom">
								{{ item.qty * item.price | currency('P') }}
							</td>
						</tr>
						<tr>
							<td colspan="3"></td>
						</tr>
						<tr>
							<td class="caption text-xs-right" colspan="2">
								Subtotal
							</td>
							<td class="caption text-xs-right">
								{{ subTotal | currency('P') }}
							</td>
						</tr>
						<tr>
							<td class="caption text-xs-right" colspan="2">
								Discount
							</td>
							<td class="caption text-xs-right">
								<span v-if="discount">{{ discount }}%</span>
							</td>
						</tr>
						<tr>
							<td class="caption text-xs-right" colspan="2">
								Total
							</td>
							<td class="caption text-xs-right">
								<strong>{{ total | currency('P') }}</strong>
							</td>
						</tr>
				</tbody>
			</table>

			<div class="text-xs-center mt-3 mb-3" v-if="!stockOrder.addedToInventory">
				<v-btn :loading="loading" :disabled="loading" @click="addToInventory" depressed large class="primary white--text" v-if="stockOrder.status === 'delivered' || stockOrder.status === 'collected'">
					<v-icon left>check_circle</v-icon> Add Stock to Inventory
				</v-btn>
			</div>

	<v-dialog
      v-model="loaderDialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{loaderDialogMessage}}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

	<Modal ref="modal" />

	</div>
</template>

<script>
import { mapGetters} from 'vuex';
import { mixins } from '@/mixins';
import BottomNav from '@/components/BottomNav';
import BasketBadge from '@/components/BasketBadge';
import Modal from '@/components/Modal';

export default {
	mixins: [mixins],
	data: () => ({
		search: null,
		loading: false,
		loaderDialog: false,
		stockOrder: {
			id: null,
			items: [],
			userId: null,
			createdAt: null
		},
		loaderDialogMessage: null,
	}),
	created () {
		this.cordovaBackButton(this.goBack);

		this.loaderDialog = true;
		this.loaderDialogMessage = 'Please wait';
		this.$store.dispatch('stock_orders/FIND', this.$route.params.id)
		.then((res) => {
			if (res.success) {
				this.stockOrder = Object.assign({}, this.stockOrder, res.data);
				console.log(this.stockOrder)
				if ((!this.stockOrder.read && this.stockOrder.status === 'processing') || (!this.stockOrder.read && this.stockOrder.status === 'cancelled')) {
					this.$store.dispatch('stock_orders/UPDATE_STOCK_ORDER', {
						id: this.stockOrder.id,
						key: 'read',
						value: true
					});
				}
			}
		})
		.catch((error) => {
			console.log(error);
		})
		.finally(() => {
			this.loaderDialogMessage = null;
			this.loaderDialog = false;
		});
	},
	methods: {
		goBack () {
			this.$router.push({
				name: 'Orders',
				query: {
					tab: 'tab2'
				}
			});
		},

		async addToInventory () {
			this.loading = true;
			try {
				const items = JSON.parse(JSON.stringify(this.stockOrder.items));
				const res = await this.$store.dispatch('inventory/ADD_ITEMS_FROM_STOCK_ORDER', items);
				if (res.success) {
					await this.$store.dispatch('stock_orders/MARKED_AS_ADDED_TO_INVENTORY', this.$route.params.id);
					this.stockOrder.addedToInventory = true;
					this.$refs.modal.show('Success', 'All items added to inventory.', () => {
						this.$router.go(-1);
					});
				}
			} catch (error) {
				this.$refs.modal.show('Error', 'An error occurred.', () => {
					this.$router.go(-1);
				});
			}
			this.loading = false;
		}
	},
	computed: {
		subTotal () {
			return this.stockOrder.items.reduce((a, b) => a + (b.price * b.qty), 0);
		},

		discount () {
			let discount;
			if (this.subTotal >= 1500 && this.subTotal <= 2999) {
				discount = 10;
			} else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
				discount = 15;
			} else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
				discount = 18;
			} else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
				discount = 20;
			} else {
				discount = null;
			}
			return discount;
		},

		total () {
			if (this.discount) {
				return this.subTotal - ((this.discount / 100) * this.subTotal);
			} else {
				return this.subTotal;
			}
		}
	},
	filters: {
		joinAttributes (val) {
			const attributes = JSON.parse(JSON.stringify(val));
			delete attributes.qty;
			delete attributes.quantity;

			const keys = Object.keys(attributes);

			let str = '';

			keys.forEach((key) => {
				str += `${key}:${attributes[key]}`;
			});

			return str;
		}
	},
	components: {
		BasketBadge,
		Modal
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
	/*background-color: #ddd;*/
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

tr.border-top td {
	border-top: 1pt solid #D0D0D0;
}

.icon {
	display: inline-flex !important;
}
</style>
