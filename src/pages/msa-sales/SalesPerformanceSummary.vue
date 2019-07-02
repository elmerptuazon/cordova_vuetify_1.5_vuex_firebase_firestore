<template>
	<div>

		<v-toolbar app color="primary" dark >
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
			<BasketBadge tabName="msa" />
			<v-spacer></v-spacer>
			<Logo />
		</v-toolbar>

		<v-container>
			<div class="text-xs-center">
				<v-chip
				color="primary"
				:text-color="m.color"
				v-for="m in menu"
				:key="m.name"
				:outline="m.outline"
				@click="select(m.name)"
				>
				<div style="width: 60px;" class="text-xs-center">{{m.title}}</div>
			</v-chip>
		</div>
		<div style="height: 20px;"></div>
		<v-card>
			<v-card-title>
				<div class="title"><span class="grey--text">&#8369;</span> &nbsp; Total Sales</div>
			</v-card-title>
			<v-card-text class="py-0">
				<v-container grid-list-md>
					<v-layout row wrap>
						<v-flex xs5>
							Actual <br />
							<div class="body-2">{{ actual.total_sales | currency('&#8369;') }}</div>
						</v-flex>
						<v-flex xs5>
							Target <br />
							<div class="body-2">{{currentView.total_sales | currency('&#8369;') }}</div>
						</v-flex>
						<v-flex xs2>
							<v-btn icon flat @click.stop="viewQuantity(currentView.total_sales, 'total_sales')" :disabled="editLoading" :loading="editLoading">
								<v-icon>border_color</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-container>
			</v-card-text>
			<v-card-text class="pa-0">
				<v-progress-linear :value="totalSalesPercentage" height="35" color="lime" ref="salesRef"></v-progress-linear>
			</v-card-text>
		</v-card>

		<v-card>
			<v-card-title>
				<div class="title"><v-icon color="grey">card_giftcard</v-icon>&nbsp; Items Sold</div>
			</v-card-title>
			<v-card-text class="py-0">
				<v-container grid-list-md>
					<v-layout row wrap>
						<v-flex xs5>
							Actual <br />
							<div class="body-2">{{ actual.sales_items }}</div>
						</v-flex>
						<v-flex xs5>
							Target <br />
							<div class="body-2">{{currentView.sales_items}}</div>
						</v-flex>
						<v-flex xs2>
							<v-btn icon flat @click.stop="viewQuantity(currentView.sales_items, 'sales_items')" :disabled="editLoading" :loading="editLoading">
								<v-icon>border_color</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-container>
			</v-card-text>
			<v-card-text class="pa-0">
				<v-progress-linear :value="salesItemsPercentage" height="35" color="lime"></v-progress-linear>
			</v-card-text>
		</v-card>

		<v-card>
			<v-card-title>
				<div class="title"><v-icon color="grey">people</v-icon>&nbsp; Customers</div>
			</v-card-title>
			<v-card-text class="py-0">
				<v-container grid-list-md>
					<v-layout row wrap>
						<v-flex xs5>
							Actual <br />
							<div class="body-2">{{ actual.customers }}</div>
						</v-flex>
						<v-flex xs5>
							Target <br />
							<div class="body-2">{{currentView.customers}}</div>
						</v-flex>
						<v-flex xs2>
							<v-btn icon flat @click.stop="viewQuantity(currentView.customers, 'customers')" :disabled="editLoading" :loading="editLoading">
								<v-icon>border_color</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-container>
			</v-card-text>
			<v-card-text class="pa-0">
				<v-progress-linear :value="customersPercentage" height="35" color="lime"></v-progress-linear>
			</v-card-text>
		</v-card>
	</v-container>
	<v-dialog v-model="dialog" max-width="300">
		<v-card>
			<v-card-title class="headline">
				Update target
			</v-card-title>
			<v-card-text class="py-1">
				<v-text-field type="number" label="Enter number here" v-model="targetData"></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn depressed class="primary white--text" @click.native="saveQuantity" :disabled="buttonLoading" :loading="buttonLoading">Save</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<v-snackbar bottom left v-model="snackbar">
		{{snackbarMsg}}
	</v-snackbar>
	<BottomNav currentTab="msa" />
</div>
</template>

<script>
import {mapGetters} from 'vuex';
import {mixins} from '@/mixins';
import { Spinner } from 'mint-ui';
import BottomNav from '@/components/BottomNav';
import BasketBadge from '@/components/BasketBadge';
import moment from 'moment';
let currentMonth = moment().format('MMMM');
let currentQuarter = moment().quarter();

export default {
	mixins: [mixins],
	data: () => ({
		menu: [
		{
			name: 'Month',
			title: currentMonth,
			color: 'white',
			outline: false
		},
		{
			name: 'Quarter',
			title: `Q${currentQuarter}`,
			color: 'primary',
			outline: true
		}
		],
		selected: 'Month',
		target: {
			data: {
				week: {
					total_sales: 0,
					sales_items: 0,
					customers: 0
				},
				month: {
					total_sales: 0,
					sales_items: 0,
					customers: 0
				},
				quarter: {
					total_sales: 0,
					sales_items: 0,
					customers: 0
				}
			}
		},
		currentView: {
			total_sales: 0,
			sales_items: 0,
			customers: 0
		},
		actual: {
			total_sales: 0,
			sales_items: 0,
			customers: 0
		},
		dialog: false,
		targetData: 0,
		buttonLoading: false,
		currentDialog: null,
		snackbar: false,
		snackbarMsg: null,
		editLoading: false,
		percentage: {
			total_sales: 0,
			sales_items: 0,
			customers: 0
		}
	}),
	created () {
		this.cordovaBackButton(this.goBack);
		this.fetchAll();
	},
	methods: {
		goBack () {
			this.$router.push({name: 'SalesPerformance'});
		},
		goTo (page) {
			this.$router.push({name: page})
		},
		select(name) {
			this.menu = this.menu.map((m) => {;
				m.color = name === m.name ? 'white' : 'primary';
				m.outline = name === m.name ? false : true;
				return m;
			});
			this.selected = name;
		},
		getPercentage (target, actual) {
			return (actual * 100) / target;
		},
		fetchAll () {
			this.editLoading = true;
			this.$store.dispatch('sales/GET_TARGET_SALES')
			.then((data) => {
				this.target = Object.assign({}, data[0]);
				if (this.selected === 'Week') {
					this.currentView = this.target.data.week;
				} else if (this.selected === 'Month') {
					this.currentView = this.target.data.month;
				} else if (this.selected === 'Quarter') {
					this.currentView = this.target.data.quarter;
				}

				return this.fetchOrders();
			})
			.then(() => {
				this.editLoading = false;
			});
		},
		viewQuantity(qty, currentDialog) {
			this.targetData = qty;
			this.currentDialog = currentDialog;
			this.dialog = true;
		},
		saveQuantity() {
			this.buttonLoading = true;
			const target_data = this.target.data;
			const target = {
				data: {
					week: {
						total_sales: +target_data.week.total_sales,
						sales_items: +target_data.week.sales_items,
						customers: +target_data.week.customers
					},
					month: {
						total_sales: +target_data.month.total_sales,
						sales_items: +target_data.month.sales_items,
						customers: +target_data.month.customers
					},
					quarter: {
						total_sales: +target_data.quarter.total_sales,
						sales_items: +target_data.quarter.sales_items,
						customers: +target_data.quarter.customers
					}
				},
				id: this.target.id
			}
			target.data[this.selected.toLowerCase()][this.currentDialog] = +this.targetData;
			this.$store.dispatch('sales/UPDATE_TARGET_SALES', target)
			.then(() => {
				this.target.data[this.selected.toLowerCase()][this.currentDialog] = +this.targetData;
				this.buttonLoading = false;
				this.dialog = false;
				this.snackbar = true;
				this.snackbarMsg = 'Target data updated';
			})
			.catch((error) => {
				console.log(error);
				this.buttonLoading = false;
				this.snackbar = true;
				this.snackbarMsg = 'An error occurred';
			});
		},
		fetchOrders () {
			this.$store.dispatch('orders/GET_RESELLER_ORDERS_BY_TIMESTAMP', {
				selected: this.selected
			})
			.then((data) => {

				const items = data.map((order) => {
					return order.basket.map(item => item);
				});
				this.actual.total_sales = data.reduce((a, order) => {
					let total = order.total

					if (order.discount) {
						if (order.discount.type == 'peso') {
							total-=order.discount.value;
						}
						else if (order.discount.type == 'percentage') {
							const discount = (order.discount.value / 100) * total;
							total-=discount;
						}
					}

					// if (order.delivery_charge) {
					// 	total+=order.delivery_charge;
					// }

					return a + total;
				}, 0);
				const totalCustomers = data.map((order) => {

					let uid;

					if (order.offlineContact) {
						uid = order.offlineContact.id;
					} else {
						uid = order.uid;
					}

					return uid;

				});

				this.actual.customers = Array.from(new Set(totalCustomers)).length;

				let flattened_items = [].concat.apply([], items);
				flattened_items = [].concat.apply([], flattened_items);

				//this.actual.total_sales = flattened_items.reduce((a, b) => +a + (+b.product.price * b.attribute.qty), 0);
				this.actual.sales_items = flattened_items.reduce((a, b) => +a + +b.attribute.qty, 0);
			});
		}
	},
	computed: {
		...mapGetters({
			'GET_LIST': 'catalogues/GET_LIST',
			'GET_ITEMS': 'basket/GET_ITEMS'
		}),
		totalSalesPercentage () {
			let p = 0;
			if (this.selected === 'Month') {
				p = this.getPercentage(this.target.data.month.total_sales, +this.actual.total_sales);
			} else if (this.selected === 'Quarter') {
				p = this.getPercentage(this.target.data.quarter.total_sales, +this.actual.total_sales);
			}
			return p;
		},
		salesItemsPercentage () {
			let p = 0;
			if (this.selected === 'Month') {
				p = this.getPercentage(this.target.data.month.sales_items, +this.actual.sales_items);
			} else if (this.selected === 'Quarter') {
				p = this.getPercentage(this.target.data.quarter.sales_items, +this.actual.sales_items);
			}
			return p;
		},
		customersPercentage () {
			let p = 0;
			if (this.selected === 'Month') {
				p = this.getPercentage(this.target.data.month.customers, +this.actual.customers);
			} else if (this.selected === 'Quarter') {
				p = this.getPercentage(this.target.data.quarter.customers, +this.actual.customers);
			}
			return p;
		}
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge,
		BottomNav
	},
	watch: {
		selected (val) {
			this.fetchAll();

			if (val === 'Week') {
				this.currentView = this.target.data.week;
			} else if (val === 'Month') {
				this.currentView = this.target.data.month;
			} else if (val === 'Quarter') {
				this.currentView = this.target.data.quarter;
			}
		}
	}
}

</script>

<style scoped>
</style>

