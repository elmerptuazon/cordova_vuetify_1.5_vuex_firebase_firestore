<template>
	<div>

		<v-toolbar app color="primary" dark :extended="extended">
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Order ID {{GET_ORDER.orderNo}}</v-toolbar-title>
			<v-text-field label="Search basket..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted prepend-icon="search"
			v-model="search"></v-text-field>
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Logo />

		</v-toolbar>

		<v-container class="pa-0 pt-2 ma-0" grid-list-xs fluid>
			<div>
				<div class="px-3 pt-1 mb-2">
					<v-layout row wrap>
						<v-flex xs4>
							<div class="text-xs-left">{{GET_ORDER.created_at | momentify('DD-MMM-YYYY')}}</div>
						</v-flex>
						<v-flex xs8>
							<div class="text-xs-right">Status: {{GET_ORDER.status | status}}</div>
						</v-flex>
					</v-layout>
				</div>
				<v-divider></v-divider>
				<table class="basket-table">
					<thead>
						<tr>
							<th class="border-bottom header-size grey--text text--darken-1">NAME</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">CLR</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">SZ</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">QTY</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">COST</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, i) in filterBy(orderBy(GET_ORDER.basket, 'created_at', -1), search)" :key="i">
							<td class="border-bottom">
								<v-layout row>
									<v-flex xs4>
										<v-avatar tile size="40px">
											<img v-lazy="item.product.imageObj" :alt="item.product.name">
										</v-avatar>
									</v-flex>
									<v-flex xs8 class="mt-2">
										<span v-html="item.product.name" class="caption"></span>
									</v-flex>
								</v-layout>

							</td>
							<td class="text-xs-right border-bottom">
								<v-icon class="body-1" :color="`${item.attribute.color.toLowerCase()}`" v-if="item.attribute.color">fiber_manual_record</v-icon>
							</td>
							<td class="caption text-xs-right border-bottom">{{ item.attribute.size }}</td>
							<td class="caption text-xs-right border-bottom">{{ item.attribute.qty }}</td>
							<td class="caption text-xs-right border-bottom">
								{{ item.attribute.qty * item.product.price | currency('P') }}
							</td>
						</tr>
						<tr>
							<td class="caption text-xs-right" colspan="4">
								Subtotal
							</td>
							<td class="caption text-xs-right">
								{{GET_ORDER.total | currency('P')}}
							</td>
						</tr>
						<tr>
							<td class="caption text-xs-right" colspan="4">
								Discount
							</td>
							<td class="caption text-xs-right">
								<div v-if="GET_ORDER.discount">
									<span v-if="GET_ORDER.discount.type === 'peso'">
										{{GET_ORDER.discount.value | currency('P')}}
									</span>
									<span v-else>
										{{GET_ORDER.discount.value}}%
									</span>
								</div>
								<div v-else>
									0
								</div>
							</td>
						</tr>
						<tr class="border-top">
							<td class="caption text-xs-right" colspan="4">
								Delivery charge
							</td>
							<td class="caption text-xs-right">
								<span v-if="GET_ORDER.delivery_charge"
								>
								{{GET_ORDER.delivery_charge | currency('P')}}
							</span>
							<span v-else>
								0.00
							</span>
						</td>
					</tr>
					<tr class="border-top">
						<td class="caption text-xs-right" colspan="4">
							Total
						</td>
						<td class="caption text-xs-right">
							{{finalPrice | currency('P')}}
						</td>
					</tr>
					<tr class="border-top">
						<td class="caption text-xs-right" colspan="4">
							Payment due
						</td>
						<td class="caption text-xs-right primary--text">
							<span v-if="GET_ORDER.payment_due_date">
								{{GET_ORDER.payment_due_date}}
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="pa-2">
			<v-card v-if="GET_ORDER.proposed_delivery_schedule">
				<v-card-title class="title">Proposed delivery schedule</v-card-title>
				<v-card-text>
					<v-layout row wrap>
						<v-flex xs3>Date</v-flex>
						<v-flex xs9>{{GET_ORDER.proposed_delivery_schedule.date}}</v-flex>
						<v-flex xs3>Time</v-flex>
						<v-flex xs9>{{GET_ORDER.proposed_delivery_schedule.time}}</v-flex>
						<v-flex xs3>Location</v-flex>
						<v-flex xs9>{{GET_ORDER.proposed_delivery_schedule.location}}</v-flex>
						<v-flex xs3 v-if="GET_ORDER.proposed_delivery_schedule.remarks">Remarks</v-flex>
						<v-flex xs9 v-if="GET_ORDER.proposed_delivery_schedule.remarks">{{GET_ORDER.proposed_delivery_schedule.remarks}}</v-flex>
					</v-layout>
				</v-card-text>
			</v-card>
			<br />
			<v-expansion-panel>
				<v-expansion-panel-content>
					<div slot="header" class="title">Payments</div>
					<v-card>
						<v-card-text class="pa-1">
							<Payments :items="GET_ORDER.payments" :hasAction="false" v-if="GET_ORDER.payments" />
							<div v-else class="text-xs-center">Payments is empty</div>
						</v-card-text>
						<v-card-text class="py-2">
							<p class="text-xs-right body-2">Total Outstanding: {{ totalOutstanding | currency('P ')}}</p>
						</v-card-text>
					</v-card>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</div>
	</v-container>

	<v-bottom-sheet v-model="deliveryScheduleSheet" persistent>
		<v-card v-if="GET_ORDER.proposed_delivery_schedule">
			<v-card-title>
				<div class="headline">Delivery Schedule</div>
			</v-card-title>
			<v-card-text class="py-0 subheading">
				Agent Seller has scheduled your item(s) delivery date. Do you agree with the delivery date and time?
				<div class="mt-3"></div>
				<v-layout row wrap>
					<v-flex xs3>Date</v-flex>
					<v-flex xs9>{{GET_ORDER.proposed_delivery_schedule.date}}</v-flex>
					<v-flex xs3>Time</v-flex>
					<v-flex xs9>{{GET_ORDER.proposed_delivery_schedule.time}}</v-flex>
					<v-flex xs3>Location</v-flex>
					<v-flex xs9>{{GET_ORDER.proposed_delivery_schedule.location}}</v-flex>
					<v-flex xs3 v-if="GET_ORDER.proposed_delivery_schedule.remarks">Remarks</v-flex>
					<v-flex xs9 v-if="GET_ORDER.proposed_delivery_schedule.remarks">{{GET_ORDER.proposed_delivery_schedule.remarks}}</v-flex>
				</v-layout>
				<div>
					<v-container grid-list-md>
						<v-layout row wrap>
							<v-flex xs6>
								<v-btn block class="primary white--text" :disabled="disableButton" :loading="disableButton" @click.native="updateDeliverySchedule('accepted')">Accept</v-btn>
							</v-flex>
							<v-flex xs6>
								<v-btn block class="red white--text" :disabled="disableButton" :loading="disableButton" @click.native="updateDeliverySchedule('declined')">Decline</v-btn>
							</v-flex>
						</v-layout>
					</v-container>
				</div>
			</v-card-text>
		</v-card>
	</v-bottom-sheet>

	<Dialog />

	<BottomNav currentTab="basket" />
</div>
</template>



<script>
import { mapGetters } from 'vuex';
import { date } from '@/mixins/date';
import { mixins } from '@/mixins';
import { COLLECTION } from '@/config/firebaseInit';
import Payments from '@/components/Payments';

export default {
	components: {Payments},
	data: () => ({
		extended: false,
		search: null,
		unsubscribeToOrders: null,
		deliveryScheduleSheet: false,
		disableButton: false
	}),
	mounted () {
		this.unsubscribeToOrders = COLLECTION.orders
		.doc(this.GET_ORDER.orderNo)
		.onSnapshot((doc) => {
			const obj = {
				orderNo: this.GET_ORDER.orderNo,
				data: doc.data()
			}

			if (!obj.data.delivery_schedule_status && obj.data.proposed_delivery_schedule) {
				this.deliveryScheduleSheet = true
			}

			this.$store.commit('orders/UPDATE_ORDER', obj);
		});

		if (this.GET_ORDER.proposed_delivery_schedule) {
			if (!this.GET_ORDER.delivery_schedule_status) {
				this.deliveryScheduleSheet = true
			}
		}
	},
	beforeDestroy () {
		this.unsubscribeToOrders()
	},
	methods: {
		goBack() {
			if (this.user.type == 'Customer') {
				this.$router.push({name: 'MyBasket'});
			} else {
				this.$router.push({name: 'Orders'});
			}
		},
		updateDeliverySchedule (status) {

			this.disableButton = true;

			const data = {
				orderNo: this.GET_ORDER.orderNo,
				object: {
					delivery_schedule_status: status
				}
			}

			if (status === 'accepted') {
				if (!this.GET_ORDER.status === 'delivered') {
					data.object.status = 'in progress';
				}
			}

			this.$store.dispatch('orders/UPDATE_ORDER', data)
			.then(() => {

				const message = status == 'accepted' ? 'Proposed delivery schedule accepted' : 'Proposed delivery schedule declined'

				this.$events.$emit('SET_DIALOG', {
					status: true,
					title: 'Success',
					message
				})
				this.disableButton = false
				this.deliveryScheduleSheet = false
			})
			.catch(e => {
				this.$events.$emit('SET_DIALOG', {
					status: true,
					title: 'Update Delivery Schedule Error',
					message: 'An error occurred.'
				})
				this.disableButton = false
				console.error(e);
			});
		}
	},
	computed: {
		...mapGetters({
			GET_ORDER: 'orders/GET_ORDER',
			user: 'accounts/user'
		}),
		finalPrice () {

			let finalPrice = this.GET_ORDER.total;

			if (this.GET_ORDER.delivery_charge) {
				finalPrice+=this.GET_ORDER.delivery_charge;
			}

			if (this.GET_ORDER.discount) {
				if (this.GET_ORDER.discount.type == 'peso') {
					finalPrice-=this.GET_ORDER.discount.value;
				}
				else if (this.GET_ORDER.discount.type == 'percentage') {
					const discount = (this.GET_ORDER.discount.value / 100) * finalPrice;
					finalPrice-=discount;
				}
			}

			return finalPrice;
		},
		totalOutstanding () {
			let totalPayments = 0;

			let finalPrice = this.GET_ORDER.total;

		

			if (this.GET_ORDER.discount) {
				if (this.GET_OxXrRDER.discount.type == 'peso') {
					finalPrice-=this.GET_ORDER.discount.value;
				}
				else if (this.GET_ORDER.discount.type == 'percentage') {
					const discount = (this.GET_ORDER.discount.value / 100) * finalPrice;
					finalPrice-=discount;
				}
			}

			if (this.GET_ORDER.payments) {
				totalPayments = this.GET_ORDER.payments.reduce(function (a,b) { return +a + +b.value; }, 0);
			}
				if (this.GET_ORDER.delivery_charge) {
				finalPrice+=this.GET_ORDER.delivery_charge;
			}
			return finalPrice - totalPayments;
		}
	},
	filters: {
		status(val) {
			return val.toUpperCase()
		}
	},
	mixins: [date, mixins]
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

</style>
