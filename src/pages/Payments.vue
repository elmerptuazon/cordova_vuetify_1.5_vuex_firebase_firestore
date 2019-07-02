<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack()">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-text-field v-model="search" label="Search payment..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="search"></v-text-field>
			<BasketBadge tabName="msa" />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer ></v-spacer>
			<Logo />
		</v-toolbar>

		<v-container class="pa-0">
			<div style="height: 63vh;  width: 100%; overflow:auto;">
				<v-data-table
				:headers="headers"
				:items="items"
				:loading="loading"
				:search="search"
				:pagination.sync="pagination"
				hide-actions
				>
				<template slot="headers" slot-scope="props">
					<tr>
						<th
						class="pa-0 pl-2 text-xs-left"
						v-for="header in props.headers"
						:key="header.text"
						:class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
						@click="changeSort(header.value)"
						>
						<v-icon small>arrow_upward</v-icon>
						{{ header.text }}
					</th>
				</tr>
			</template>
			<template slot="items" slot-scope="props">
				<tr>
					<td class="text-xs-left thick py-0" style="white-space: nowrap;">{{ props.item.name }}</td>
					<td class="text-xs-center thick px-1">{{ props.item.outstanding | currency('₱') }}</td>
					<td class="text-xs-center thick px-1 red--text">{{ props.item.overdue | currency('₱') }}</td>
				</tr>
			</template>
		</v-data-table>
	</div>
	<div style="position: fixed; width: 100%; bottom: 8%;">
		<v-data-table
		:headers="[{ text: 'Total', sortable: false, class: 'footer-title' }, {sortable: false}, {sortable: false}]"
		hide-actions
		:items="[{first: '# OF CUSTOMERS', second: 'OUTSTANDING', third: 'OVERDUE' }]"
		>
		<template slot="headers" slot-scope="props">
			<tr>
				<th  v-for="header in props.headers" :key="header.text">
					<span class="headline">{{header.text}}</span>
				</th>
			</tr>
		</template>
		<template slot="items" slot-scope="props">
			<tr>
				<td class="text-xs-center">{{ props.item.first }}</td>
				<td class="text-xs-center">{{ props.item.second }}</td>
				<td class="text-xs-center">{{ props.item.third }}</td>
			</tr>
		</template>
		<template slot="footer">
			<tr>
				<td class="text-xs-center thick">{{noOfCustomers}}</td>
				<td class="text-xs-center thick">{{totalOutstanding | currency('₱')}}</td>
				<td class="text-xs-center thick red--text">{{totalOverdue | currency('₱')}}</td>
			</tr>
		</template>
	</v-data-table>
</div>
</v-container>
<BottomNav currentTab="msa" />
</div>
</template>




<script>
import {mapGetters} from 'vuex';
import { Spinner } from 'mint-ui';
import BasketBadge from '@/components/BasketBadge';
import {mixins} from '@/mixins';
export default {
	mixins: [mixins],
	data: () => ({
		extended: false,
		search: null,
		loading: false,
		headers: [
			{ text: 'Name', value: 'name' },
			{ text: 'Outstanding', value: 'outstanding', align: 'center' },
			{ text: 'Overdue', value: 'overdue', align: 'center' }
		],
		items: [],
		pagination: {
			sortBy: 'name',
			rowsPerPage: 0
		}
	}),
	created () {
		this.loading = true;
		const includeSelfOrders = false;
		this.$store.dispatch('orders/GET_RESELLER_ORDERS', includeSelfOrders)
		.then((data) => {
			this.loading = false;
			this.items = data.map((order) => {
				return {
					name: order.fullName,
					outstanding: this.getOutstanding(order.orders),
					overdue: this.getOverdue(order.orders)
				};
			});
		})
		.catch(error => {
			console.log(error);
		});
	},
	methods: {
		goBack () {
			// this.$router.push({name: 'MySellingAssistant'});
			this.$router.go(-1);
		},
		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
		},
		getOutstanding (orders) {
			let totalOutstanding = 0;

			orders.forEach((order) => {
				let totalPayments = 0

				let finalPrice = order.total

		// HAS DISCOUNT
		if (order.discount) {
			if (order.discount.type == 'peso') {
				finalPrice-=order.discount.value
			}
			else if (order.discount.type == 'percentage') {
				const discount = (order.discount.value / 100) * finalPrice
				finalPrice-=discount
			}
		}

		// HAS DELIVERY CHARGE
		if (order.delivery_charge) {
			finalPrice+=order.delivery_charge
		}

		// HAS PAYMENTS
		if (order.payments) {
			totalPayments = order.payments.reduce((a,b) => +a + +b.value, 0)
		}

		totalOutstanding += (finalPrice - totalPayments)
	});

			return totalOutstanding;
		},
		getOverdue (orders) {
			let totalOverdue = 0;

			orders.forEach((order) => {
				let totalPayments = 0

				let finalPrice = order.total

		// HAS DISCOUNT
		if (order.discount) {
			if (order.discount.type == 'peso') {
				finalPrice-=order.discount.value
			}
			else if (order.discount.type == 'percentage') {
				const discount = (order.discount.value / 100) * finalPrice
				finalPrice-=discount
			}
		}

		// HAS DELIVERY CHARGE
		if (order.delivery_charge) {
			finalPrice+=order.delivery_charge
		}

		// HAS PAYMENTS
		if (order.payments) {
			totalPayments = order.payments.reduce((a,b) => +a + +b.value, 0)
		}

		// HAS PAYMENT DUE DATE AND IS OVERDUE
		if (order.payment_due_date) {

			const due = this.$moment(order.payment_due_date, 'MM/DD/YYYY').format('YYYY-MM-DD');
			const today = this.$moment().format('YYYY-MM-DD');

		  // if today is greater than due date
		  if (this.$moment(today).isAfter(due)) {
		  	totalOverdue += (finalPrice - totalPayments)
		  }

		}
	});

			return totalOverdue;
		}
	},
	computed: {
		...mapGetters({
			'GET_LIST': 'catalogues/GET_LIST',
			'GET_ITEMS': 'basket/GET_ITEMS'
		}),
		noOfCustomers () {
			return this.items.length;
		},
		totalOutstanding () {
			return this.items.reduce((a, b) => +a + +b.outstanding, 0);
		},
		totalOverdue () {
			return this.items.reduce((a, b) => +a + +b.overdue, 0);
		}
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge
	},
	watch: {
		items (val) {
			this.pagination.rowsPerPage = val.length;
		}
	}
}

</script>

<style scoped>
.responsive {
  width: 100%;
  height: auto;
}

.footer-title {
  font-size: 30px;
}

.thick {
  font-weight: bold;
}
</style>

