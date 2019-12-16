<template>
	<div>

		<v-toolbar app color="primary" dark :extended="extended">
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-text-field label="Search basket..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted prepend-icon="search"
			v-model="search"></v-text-field>
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Accounts />
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
						<tr v-for="(item, i) in filterBy(orderBy(GET_ITEMS, 'created_at', -1), search)" :key="i">
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
								<v-icon class="body-1" :color="`${item.attribute.color.toLowerCase()}`" v-if="item.attribute.color">fiber_manual_record</v-icon>
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
								Subtotal
							</td>
							<td class="caption text-xs-right">
								{{GET_SUBTOTAL | currency('P')}}
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
						</tr>
					</tbody>
				</table>
				<div class="text-xs-center mt-3">
					<v-btn @click="placeOrder" depressed large color="primary" class="white--text" :loading="disableCheckoutButton" :disabled="disableCheckoutButton">
						<v-icon left>check_circle</v-icon> Place Order</v-btn>
					</div>
				</div>
			</v-container>
		</div>
	</template>

<script>
	import { mapGetters } from 'vuex';
	import { mixins } from '@/mixins'

	export default {
		mixins: [mixins],
		data: () => ({
			extended: false,
			search: null,
			disableCheckoutButton: false
		}),
		created() {
			this.cordovaBackButton(this.goBack);
		},
		methods: {
			goBack() {
				this.$router.push({name: 'Basket', params: {from: this.$route.params.from}})
			},
			placeOrder () {
				this.disableCheckoutButton = true
				this.$store.dispatch('orders/PLACE_ORDER')
				.then((res) => {
					console.log('success', res)
					this.disableCheckoutButton = false
					this.$store.dispatch('basket/EMPTY_BASKET')
					this.$router.push({name: 'CheckoutSuccess', params: {orderDetails: res}})
				})
			}
		},
		computed: {
			...mapGetters({
				'GET_ITEMS': 'basket/GET_ITEMS',
				'GET_SUBTOTAL': 'basket/GET_SUBTOTAL'
			})
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
		border-bottom: 1px solid #1976D2;
	}

	.header-size {
		font-size: 10px;
	}

	</style>
