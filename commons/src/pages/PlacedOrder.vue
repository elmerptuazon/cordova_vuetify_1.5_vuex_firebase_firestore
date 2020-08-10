<template>
	<div>

		<v-toolbar app color="primary" dark :extended="extended">
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Order ID {{order.id}}</v-toolbar-title>
			<v-text-field label="Search basket..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted prepend-icon="search"
			v-model="search"></v-text-field>
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-btn icon @click.stop="deleteConfirmationDialog = true" v-if="(user.type === 'Reseller' && order.status === 'placed') || (user.type === 'Reseller' && order.status === 'in progress')">
				<v-icon>delete</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Accounts />
		</v-toolbar>

		<v-container class="pa-0 pt-2 ma-0" grid-list-xs fluid>
			<div>
				<div class="px-3 pt-1 mb-2">
					<v-layout row wrap>
						<v-flex xs6>
							<div class="text-xs-left" style="font-size: 11px;">
								<v-avatar size="20px" v-if="!order.isOffline">
									<v-img :src="malePlaceholder" contain v-if="!order.offlineContact.downloadURL && order.offlineContact.gender === 'Male'"></v-img>
									<v-img :src="femalePlaceholder" contain v-else-if="!order.offlineContact.downloadURL && order.offlineContact.gender === 'Female'"></v-img>
									<v-img :src="order.offlineContact.downloadURL" contain v-else-if="order.offlineContact.downloadURL"></v-img>
								</v-avatar>
								<v-avatar size="20px" v-else>
									<img v-lazy="order.offlineContact.imageObj">
								</v-avatar>
								&nbsp;
								<span v-if="!order.isOffline">
									{{order.offlineContact.firstName}} {{order.offlineContact.middleInitial || ''}} {{order.offlineContact.lastName}}
								</span>
								<span v-else>
									{{order.offlineContact.firstName}} {{order.offlineContact.middleInitial || ''}} {{order.offlineContact.lastName}}
								</span>
							</div>
						</v-flex>
						<v-flex xs3>
							<div class="text-xs-left" style="font-size: 11px;">{{order.created_at | momentify('DD-MMM-YYYY')}}</div>
						</v-flex>
						<v-flex xs3>
							<div class="text-xs-right" style="font-size: 11px;">Status: {{order.status | status}}</div>
						</v-flex>
					</v-layout>
					<v-layout row wrap>
						<v-flex xs6>
							<div class="text-xs-left" style="font-size: 11px;">
								<span >
									Order: {{order.id}} 
								</span>
							</div>
						</v-flex>
						<v-flex xs3>
							
						</v-flex>
						<v-flex xs3>
							
						</v-flex>
					</v-layout>
				</div>
				<v-divider></v-divider>
				<table class="basket-table">
					<thead>
						<tr>
							<th class="border-bottom text-xs-center header-size grey--text text--darken-1">NAME</th>
							<th class="border-bottom text-xs-left header-size grey--text text--darken-1">VARIANT</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">QTY</th>
							<th class="border-bottom text-xs-right header-size grey--text text--darken-1">COST</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, i) in filterBy(orderBy(order.basket, 'created_at', -1), search)" :key="i">
							<td class="border-bottom">
								<v-layout row>
									<v-flex xs4>
										<v-avatar tile size="40px">
											<v-img :src="item.product.downloadURL" :alt="item.product.name" contain></v-img>
										</v-avatar>
									</v-flex>
									<v-flex xs8 class="mt-1 pl-2">
										<span v-html="item.product.name" class="caption"></span>
									</v-flex>
								</v-layout>
							</td>
							<td class="caption text-xs-left border-bottom">
                <div v-for="[key, value] in Object.entries(item.attribute)" :key="key">
                  <span v-if="key !== 'qty'">
                    <div>{{ key.toUpperCase() }}:</div>
                    <div class="font-weight-bold">{{ value }}</div>
                  </span>
                </div>
							</td>
							<td class="caption text-xs-right border-bottom">{{ item.attribute.qty }}</td>
							<td class="caption text-xs-right border-bottom">
								{{ item.attribute.qty * item.product.price | currency('P') }}
							</td>
						</tr>

						<tr>
							<td colspan="4"></td>
						</tr>

						<tr>
							<td class="caption text-xs-right" colspan="3">
								Subtotal
							</td>
							<td class="caption text-xs-right">
								{{order.total | currency('P')}}
							</td>
						</tr>

						<tr>
							<td>
								<v-btn v-if="!order.ownOrder" icon flat color="primary" @click="openSheet('discount')" style="height: 50%; font-size: 12px;">
									<v-icon small >border_color</v-icon>
								</v-btn>
							</td>
							<td class="caption text-xs-right" colspan="2">
								Discount
							</td>
							<td class="caption text-xs-right">
								<div v-if="order.discount">
									<span v-if="order.discount.type === 'peso'">
										{{order.discount.value | currency('P')}}
									</span>
									<span v-else>
										{{order.discount.value}}%
									</span>
								</div>
								<div v-else>
									0
								</div>
							</td>
						</tr>

						<tr class="border-top">
							<td>
								<v-btn v-if="!order.ownOrder" icon flat color="primary"  @click="openSheet('delivery_charge')" style="height: 50%; font-size: 12px;">
									<v-icon small>border_color</v-icon>
								</v-btn>
							</td>
							<td class="caption text-xs-right" colspan="2">
								Delivery charge
							</td>
							<td class="caption text-xs-right">
                <span v-if="order.delivery_charge"
                >
                {{order.delivery_charge | currency('P')}}
                </span>
                <span v-else>
                  0.00
                </span>
              </td>
					  </tr>
            <tr class="border-top">
              <td class="caption text-xs-right" colspan="3">
                Total
              </td>
              <td class="caption text-xs-right">
                {{finalPrice | currency('P')}}
              </td>
            </tr>
            <tr class="border-top">
              <td>
                <v-btn v-if="!order.ownOrder" icon flat color="primary" @click="openSheet('payment_due_date')" style="height: 50%; font-size: 12px;">
                  <v-icon small>border_color</v-icon>
                </v-btn>
              </td>
              <td class="caption text-xs-right" colspan="2">
                Payment due
              </td>
              <td class="caption text-xs-right primary--text">
                <span v-if="order.payment_due_date">
                  {{order.payment_due_date}}
                </span>
              </td>
            </tr>
				  </tbody>
			  </table>
        <div class="pa-4" v-if="!order.ownOrder">
          <v-expansion-panel v-if="!order.selfOrder">
            <v-expansion-panel-content>
              <div slot="header">Payments</div>
              <v-card>
                <v-card-text class="pa-1">
                  <Payments :items="order.payments" v-if="order.payments" @EDIT_PAYMENT="editPayment" @ADD="paymentAddEvent" />
                  <div v-else class="text-xs-center">
                    Payments is empty <br />
                    <v-btn v-if="user.type === 'Reseller'" small flat icon @click.native="paymentAddEvent"><v-icon color="primary">add</v-icon></v-btn>
                  </div>
                </v-card-text>
                <v-card-text class="py-2">
                  <p class="text-xs-right body-2">Total Outstanding: {{ totalOutstanding | currency('P ')}}</p>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <div style="height: 10px;"></div>
          <v-expansion-panel v-if="!order.selfOrder">
            <v-expansion-panel-content>
              <div slot="header">
                Delivery Schedule
                <span
                v-if="order.delivery_schedule_status && order.delivery_schedule_status === 'accepted'"
                class="green--text text--darken-3">- 
                  <strong v-if="order.isOffline">Saved</strong>
                  <strong v-else>Accepted</strong>
                </span>
                <span v-else-if="order.delivery_schedule_status && order.delivery_schedule_status === 'declined'" class="red--text">- <strong>Declined</strong>
                </span>
              </div>
              <v-card>
                <v-card-text class="py-2">
                  <div v-if="order.proposed_delivery_schedule">
                    <v-layout row wrap>
                      <v-flex xs3>Date</v-flex>
                      <v-flex xs9>{{order.proposed_delivery_schedule.date}}</v-flex>
                      <v-flex xs3>Time</v-flex>
                      <v-flex xs9>{{order.proposed_delivery_schedule.time}}</v-flex>
                      <v-flex xs3>Location</v-flex>
                      <v-flex xs9>{{order.proposed_delivery_schedule.location}}</v-flex>
                      <v-flex xs3 v-if="order.proposed_delivery_schedule.remarks">Remarks</v-flex>
                      <v-flex xs9 v-if="order.proposed_delivery_schedule.remarks">{{order.proposed_delivery_schedule.remarks}}</v-flex>
                    </v-layout>
                    <div class="text-xs-center">
                      <v-btn small round depressed color="primary" @click="openSheet('schedule_delivery')">Edit</v-btn>
                    </div>
                  </div>
                  <div v-else>
                    No delivery schedule yet.
                    <div class="text-xs-center">
                      <v-btn flat @click="openSheet('schedule_delivery')">
                        <v-icon color="primary">add</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <div style="height: 3px;"></div>
          <v-btn v-show="order.status !== 'delivered'" block class="primary white--text" @click="markAsDelivered" :disabled="disableButton" :loading="disableButton">
            Mark as Delivered
          </v-btn>
        </div>
        <div v-if="order.status == 'delivered'" class="text-xs-center mt-2">
          <h3>Delivered on {{order.delivered_date | momentify('DD-MMM-YYYY')}}</h3>
        </div>
        <v-bottom-sheet v-model="sheet">
          <v-card v-if="selected === 'discount'">
            <v-card-title>
              <div class="title">Discount</div>
              <v-spacer></v-spacer>
              <v-btn icon @click.native="sheet = false">
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="py-0">
              <v-radio-group v-model="discount.type" row>
                <v-radio label="Percentage" value="percentage" color="primary"></v-radio>
                <v-radio label="Peso" value="peso" color="primary"></v-radio>
              </v-radio-group>
              <v-text-field placeholder="Enter amount here..." v-model="discount.value" type="number"></v-text-field>
              <div class="pa-2">
                <v-btn block class="primary white--text" @click.native="addDiscount" :disabled="disableButton" :loading="disableButton">Add Discount</v-btn>
              </div>
            </v-card-text>
          </v-card>
          <v-card v-else-if="selected === 'delivery_charge'">
            <v-card-title>
              <div class="title">Delivery Charge</div>
              <v-spacer></v-spacer>
              <v-btn icon @click.native="sheet = false">
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="py-0">
              <v-text-field placeholder="Enter amount here..." v-model="delivery_charge.value" type="number"></v-text-field>
              <div class="pa-2">
                <v-btn block class="primary white--text" @click.native="addDeliveryCharge" :disabled="disableButton" :loading="disableButton">Add Delivery Charge</v-btn>
              </div>
            </v-card-text>
          </v-card>
          <v-card v-else-if="selected === 'payment_due_date'">
            <v-card-title>
              <div class="title">Payment Due Date</div>
              <v-spacer></v-spacer>
              <v-btn icon @click.native="sheet = false">
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="py-0">
              <v-text-field :type="calendarType" placeholder="Click to add date" v-model="payment_due_date.value" @click="openCalendar"></v-text-field>
              <div class="pa-2">
                <v-btn block class="primary white--text" :disabled="disableButton" :loading="disableButton" @click.native="addPaymentDueDate">Add Payment Due Date</v-btn>
              </div>
            </v-card-text>
          </v-card>
          <v-card v-else-if="selected === 'record_payment'">
            <v-card-title>
              <div class="title">Record Payment</div>
              <v-spacer></v-spacer>
              <v-btn icon @click.native="sheet = false">
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="py-0">
              <v-text-field placeholder="Enter amount here..." v-model="record_payment.value" type="number"></v-text-field>
              <v-text-field :type="calendarType" placeholder="Payment made on" v-model="record_payment.date" @click="openCalendar"></v-text-field>
              <div class="pa-2">
                <v-btn block :disabled="recordPaymentIsLoading" :loading="recordPaymentIsLoading" class="primary white--text" @click.native="recordPayment">Record Payment</v-btn>
                <v-btn block class="red white--text" v-if="payment_ref" @click="deletePayment">Delete Payment</v-btn>
              </div>
            </v-card-text>
          </v-card>
          <v-card v-else-if="selected === 'schedule_delivery'">
            <v-card-title>
              <div class="title">Schedule Delivery</div>
              <v-spacer></v-spacer>
              <v-btn icon @click.native="hideKeyboard">
                <v-icon>keyboard_hide</v-icon>
              </v-btn>
              <v-btn icon @click.native="sheet = false">
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="py-0">
              <div class="mb-3" v-if="order.delivery_schedule_status">
                <v-chip color="green" text-color="white" v-if="order.delivery_schedule_status === 'accepted'">
                  <span v-if="order.isOffline">Saved</span>
                  <span v-else>Accepted</span>
                </v-chip>
                <v-chip color="red" text-color="white" v-else>Declined</v-chip>
              </div>
              <v-text-field label="Date" :type="calendarType" v-model="schedule_delivery.date" @click="openCalendar"></v-text-field>
              <v-text-field label="Time" v-model="schedule_delivery.time" type="time"></v-text-field>
              <v-text-field label="Location" v-model="schedule_delivery.location"></v-text-field>
              <v-text-field label="Remarks" v-model="schedule_delivery.remarks"></v-text-field>
              <div class="pa-2">
                <v-btn v-if="order.isOffline" block class="primary white--text" @click.native="saveToCalendar">Save to Calendar</v-btn>
                <v-btn v-else block class="primary white--text" @click.native="proposeDeliverySchedule">Send Proposed Delivery Date</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-bottom-sheet>
		  </div>
	  </v-container>
	  <Dialog />

    <v-dialog v-model="deliveredDialog" width="250">
      <v-card>
        <v-card-text>
          <div class="headline text-xs-center blue--text text--darken-2" v-if="order.isOffline">
            Order No. {{order.id}} has been received by customer 
            {{order.offlineContact.firstName}} {{order.offlineContact.middleInitial || ''}} {{order.offlineContact.lastName || ''}}.
            Your inventory has been adjusted accordingly. 

          </div>
          <div class="headline text-xs-center blue--text text--darken-2" v-else>
            Order No. {{order.id}} has been received by customer 
            {{order.offlineContact.firstName}} {{order.offlineContact.middleInitial || ''}} {{order.offlineContact.lastName}}.
            Your inventory has been adjusted accordingly.
          </div>
          <CheckMark />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirmationDialog">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-text>
          This will permanently remove the order in the database.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-2" flat @click="deleteConfirmationDialog = false">
            No
          </v-btn>
          <v-btn color="red" flat @click="deleteOrder">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ConfirmationModal ref="ConfirmationModal" confirmText="Yes" @confirmClicked="markAsDeliveredConfirm" />
    <Modal ref="Modal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { date } from '@/mixins/date';
import { mixins } from '@/mixins';
import { COLLECTION } from '@/config/firebaseInit';
import CheckMark from '@/components/CheckMark';
import Payments from '@/components/Payments';
import ConfirmationModal from '@/components/ConfirmationModal';
import Modal from '@/components/Modal';
const malePlaceholder = require('./../../static/img/male-default.jpg');
const femalePlaceholder = require('./../../static/img/female-default.jpg');

export default {
	data: () => ({
		extended: false,
		search: null,
		order: {},
		selected: null,
		sheet: false,
		discount: {
			type: 'percentage',
			value: null
		},
		delivery_charge: {
			value: null
		},
		payment_due_date: {
			value: null
		},
		record_payment: {
			date: null,
			value: null
		},
		schedule_delivery: {
			date: null,
			time: null,
			location: null,
			remarks: null
		},
		disableButton: false,
		unsubscribeToOrders: null,
		deliveredDialog: false,
		showSheetButtons: true,
		calendarType: 'date',
		payment_ref: null,
		deleteConfirmationDialog: false,
		recordPaymentIsLoading: false
	}),
	created () {
		this.order = {...this.$route.params.order};
		console.log(this.order)

		if (this.order && !this.order.read) {
			COLLECTION.orders.doc(this.$route.params.order.id).update({read: true});
		}

		if (this.order.discount) {
			this.discount = Object.assign({}, this.order.discount);
		}

		if (this.order.delivery_charge) {
			this.delivery_charge.value = this.order.delivery_charge;
		}

		if (this.order.payment_due_date) {
			this.payment_due_date.value = this.order.payment_due_date;
		}

		if (this.order.proposed_delivery_schedule) {
			this.schedule_delivery = Object.assign({}, this.order.proposed_delivery_schedule);
		}

		console.log(this.order)

		document.addEventListener('deviceready', () => {
			this.calendarType = 'text'
		}, false);
	},
	mounted () {
		this.unsubscribeToOrders = COLLECTION.orders
		.doc(this.order.id)
		.onSnapshot((doc) => {
			const docData = doc.data();
			this.order = Object.assign({}, this.order, docData);

			console.log('updated order', this.order)

			if (this.order.proposed_delivery_schedule) {
				this.schedule_delivery = Object.assign({}, this.order.proposed_delivery_schedule);
			}
		});
	},
	beforeDestroy () {
		this.unsubscribeToOrders();
	},
	methods: {
		goBack() {
			this.$router.push({name: 'Orders'});
		},
		openSheet (selected) {
			this.selected = selected
			this.sheet = true
		},
		openCalendar () {

			const options = {
				date: new Date(),
				mode: 'date',
				androidTheme: 3
			}

			datePicker.show(options, (date) => {

				if (this.selected === 'payment_due_date') {
					this.payment_due_date.value = this.$moment(date).format('MM/DD/YYYY');
				}
				else if (this.selected === 'record_payment') {
					this.record_payment.date = this.$moment(date).format('MM/DD/YYYY');
				}
				else if (this.selected === 'schedule_delivery') {
					this.schedule_delivery.date = this.$moment(date).format('MM/DD/YYYY');
				}

			}, (error) => {
				console.log('cancelled', error);
			});

		},
		addDiscount () {
			const data = {
				orderNo: this.order.id,
				object: {
					discount: {
						type: this.discount.type,
						value: +this.discount.value
					},
					status: 'in progress'
				}
			}

			this.updatePlacedOrder(data)
		},
		addDeliveryCharge () {

			if (!this.delivery_charge.value) {
				return
			}

			const data = {
				orderNo: this.order.id,
				object: {
					delivery_charge: +this.delivery_charge.value,
					status: 'in progress'
				}
			}

			this.updatePlacedOrder(data)
		},
		addPaymentDueDate () {

			if (!this.payment_due_date.value) {
				return
			}

			const data = {
				orderNo: this.order.id,
				object: {
					payment_due_date: this.payment_due_date.value,
					status: 'in progress'
				}
			}

			this.updatePlacedOrder(data)
		},
		recordPayment () {
			if (!this.record_payment.date && !this.record_payment.value) {
				return
			}
			this.recordPaymentIsLoading = true;
			if (!this.order.hasOwnProperty('payments')) {
				const data = {
					orderNo: this.order.id,
					object: {
						payments: [],
						status: 'in progress'
					}
				}

				const payment = {
					date: this.record_payment.date,
					value: this.record_payment.value,
					ref: this.makeId()
				}
				data.object.payments.push(payment)

				this.updatePlacedOrder(data)
			}
			else {

				const data = {
					orderNo: this.order.id,
					object: {
						payments: this.order.payments,
						status: 'in progress'
					}
				}

				if (this.payment_ref) {
					const i = data.object.payments.findIndex(p => p.ref == this.payment_ref)
					if (i >= 0) {
						data.object.payments[i].date = this.record_payment.date
						data.object.payments[i].value = this.record_payment.value
						this.updatePlacedOrder(data)
					}
				} else {
					const payment = {
						date: this.record_payment.date,
						value: this.record_payment.value,
						ref: this.makeId()
					}
					data.object.payments.push(payment)

					this.updatePlacedOrder(data)
				}
			}
			
		},
		editPayment (item) {

			this.record_payment.date = item.date
			this.record_payment.value = item.value

			this.selected = 'record_payment'
			this.payment_ref = item.ref
			this.sheet = true
		},
		deletePayment () {
			const data = {
				orderNo: this.order.id,
				object: {
					payments: this.order.payments
				}
			}

			if (this.payment_ref) {
				const i = data.object.payments.findIndex(p => p.ref == this.payment_ref);
				if (i >= 0) {
					data.object.payments.splice(i, 1);
					this.updatePlacedOrder(data)
				}
			}
		},
		paymentAddEvent () {
			this.openSheet('record_payment');
		},
		proposeDeliverySchedule () {

			if (!this.schedule_delivery.date || !this.schedule_delivery.time || !this.schedule_delivery.location) {
				return
			}

			const scheduleDelivery = JSON.parse(JSON.stringify(this.schedule_delivery));
			scheduleDelivery.timestamp = +this.$moment(scheduleDelivery.date, 'MM/DD/YYYY').format('x');
			const data = {
				orderNo: this.order.id,
				object: {
					proposed_delivery_schedule: scheduleDelivery,
					delivery_schedule_status: null,
					delivery_schedule_status_acknowledged: null,
					status: 'in progress'
				}
			}

			this.updatePlacedOrder(data)
		},
		saveToCalendar () {
			if (!this.schedule_delivery.date || !this.schedule_delivery.time || !this.schedule_delivery.location) {
				return;
			}
			const scheduleDelivery = JSON.parse(JSON.stringify(this.schedule_delivery));
			scheduleDelivery.timestamp = +this.$moment(scheduleDelivery.date, 'MM/DD/YYYY').format('x');
			const data = {
				orderNo: this.order.id,
				object: {
					proposed_delivery_schedule: scheduleDelivery,
					delivery_schedule_status: 'accepted',
					delivery_schedule_status_acknowledged: true,
					status: 'in progress'
				}
			}

			// this.order.delivery_schedule_status = 'accepted';

			this.updatePlacedOrder(data);
		},
		updatePlacedOrder (data) {
			this.disableButton = true

			if (data.object.status == 'delivered') {
				this.deliveredDialog = true
			}

			// check if item is already delivered
			if (this.order.status === 'delivered') {
				data.object.status = 'delivered';
			}

			this.$store.dispatch('orders/UPDATE_ORDER', data)
			.then(() => {

				if (data.object.status != 'delivered') {
					this.$refs.Modal.show('Success', 'Order successfully updated.');
				}

				this.disableButton = false;
				this.sheet = false;
				this.recordPaymentIsLoading = false;
			})
			.catch((e) => {
				this.$refs.Modal.show('Error', 'An error occurred.');
				this.disableButton = false;
				this.sheet = false;
				this.recordPaymentIsLoading = false;
				console.log(e);
			})
		},
		markAsDelivered () {
			this.$refs.ConfirmationModal.show('Confirm', 'Are you sure you want to mark this order as delivered?');
		},
		async markAsDeliveredConfirm () {
			this.disableButton = true
			// check for items that has less value than orders
			// const items = [];
			// this.order.basket.forEach((item) => {

			// });
			const orders = await this.getInventory();

			const items = [];

			this.order.basket.forEach((basket) => {

				const index = orders.findIndex(item => item.unique === basket.unique);
				if (index !== -1) {
					if (orders[index].inventory < orders[index].orders) {
						items.push(basket);
					}
				}
			});

			if (items.length > 0) {
				this.$refs.ConfirmationModal.close();
				this.$refs.Modal.show('Error', 'Items with less inventory than orders found. Please update your inventory.');
				this.disableButton = false;
				return;
			}

			const data = {
				orderNo: this.order.id,
				object: {
					status: 'delivered',
					delivered_date: Date.now()
				}
			}

			await this.$store.dispatch('inventory/UPDATE_INVENTORY_NET', this.order.id);

			this.updatePlacedOrder(data);

			this.$refs.ConfirmationModal.close();
		},
		deleteOrder () {
			console.log(this.order)
			this.$store.dispatch('orders/DELETE_ORDER', this.order.id)
			.then(() => {
				this.$router.go(-1);
			})
			.catch((error) => {
				console.log(error);
			});
		},
		hideKeyboard () {
			console.log('Hiding keyboard...');
			window.Keyboard.hide();
		},

		async getInventory () {
			const data = await this.$store.dispatch('orders/GET_RESELLER_ORDERS', true);

			const items = data.map((order) => {
				let placedOrders = order.orders.filter(item => item.status !== 'delivered');
				return placedOrders.map(item => item.basket);
			});

			let flattened_items = [].concat.apply([], items);
			flattened_items = [].concat.apply([], flattened_items);

			const orders = [];

			flattened_items.forEach((item) => {

				const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
				delete itemAttributesCopy.qty;
				delete itemAttributesCopy.quantity;
				const attributes = Object.values(itemAttributesCopy).sort();
				const unique = item.product.id + '_' + attributes.join('-');
				const orderIndex = orders.findIndex(o => o.unique === unique);

				if (orderIndex >= 0) {
					orders[orderIndex].orders += item.attribute.qty;
					orders[orderIndex].net = (orders[orderIndex].inventory - orders[orderIndex].orders)
				} else {

					const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
					delete itemAttributesCopy.qty;
					delete itemAttributesCopy.quantity;
					const attributes = Object.values(itemAttributesCopy).sort();
					const unique = item.product.id + '_' + attributes.join('-');

					orders.push({
						id: item.product.id,
						imageObj: item.product.imageObj,
						downloadURL: item.product.downloadURL || null,
						name: item.product.name,
						orders: item.attribute.qty,
						unique,
						attributes: item.attribute,
						inventory: 0,
						net: 0 - item.attribute.qty
					});
				}
			});

			const res = await this.$store.dispatch('inventory/GET_INVENTORY');
			
			const addedItemsFromCatalogue = [];

			res.forEach((inv) => {
				const productIndex = orders.findIndex(order => order.unique === inv.unique);
				if (productIndex >= 0) {
					orders[productIndex].inventory = inv.inventory;
					orders[productIndex].net = inv.inventory - orders[productIndex].orders;
					orders[productIndex].inventory_id = inv.id;
				} else {
					addedItemsFromCatalogue.push(
						this.$store.dispatch('products/GET_PRODUCT', inv.productId)
						.then((product) => {
							product.newItem = inv;
							return product;
						})
					);
				}
			});

			const newItems = await Promise.all(addedItemsFromCatalogue);

			newItems.forEach((item) => {
				const inv = JSON.parse(JSON.stringify(item.newItem));
				if (item.imageObj) {
					inv.imageObj = item.imageObj;
				} else {
					inv.downloadURL = item.downloadURL;
				}
				inv.name = item.name;
				inv.orders = 0;
				inv.net = inv.inventory - inv.orders;
				inv.inventory_id = inv.id;
				orders.push(inv);
			});

			return orders;
		}
	},
	components: {
		CheckMark,
		Payments,
		ConfirmationModal,
		Modal
	},
	computed: {
		malePlaceholder () {
			return malePlaceholder;
		},
		femalePlaceholder () {
			return femalePlaceholder;
		},
		...mapGetters({
			user: 'accounts/user'
		}),
		finalPrice () {
			let finalPrice = this.order.total

			if (this.order.discount) {
				if (this.order.discount.type == 'peso') {
					finalPrice-=this.order.discount.value;
				} else if (this.order.discount.type == 'percentage') {
					const discount = (this.order.discount.value / 100) * finalPrice;
					finalPrice-=discount;
				}
			}


			if (this.order.delivery_charge) {
				finalPrice+=this.order.delivery_charge;
			}


			return finalPrice
		},
		totalOutstanding () {
			let totalPayments = 0;

			let finalPrice = this.order.total;

			

			if (this.order.discount) {
				if (this.order.discount.type == 'peso') {
					finalPrice-=this.order.discount.value;
				}
				else if (this.order.discount.type == 'percentage') {
					const discount = (this.order.discount.value / 100) * finalPrice;
					finalPrice-=discount;
				}
			}

			if (this.order.payments) {
				totalPayments = this.order.payments.reduce(function (a,b) { return +a + +b.value; }, 0);
			}
			if (this.order.delivery_charge) {
				finalPrice+=this.order.delivery_charge;
			}
			return finalPrice - totalPayments;
		}
	},
	filters: {
		status(val) {
			return val.toUpperCase()
		}
	},
	mixins: [date, mixins],
	watch: {
		sheet (val) {
			if (!val) {
				this.selected = null
				this.payment_ref = null
				this.record_payment = {
					date: null,
					value: null
				}
			}
		}
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

/* .basket-table tr:hover {
  background-color: #ddd;
} */

.basket-table td.border-bottom {
  border-bottom: 1px solid #ddd;
}

.basket-table th.border-bottom {
  border-bottom: 1px solid #1976d2;
}

.header-size {
  font-size: 10px;
}

tr.border-top td {
  border-top: 1pt solid #d0d0d0;
}

.icon {
  display: inline-flex !important;
}
</style>
