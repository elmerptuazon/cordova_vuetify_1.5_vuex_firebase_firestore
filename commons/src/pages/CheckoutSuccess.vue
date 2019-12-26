<template>
	<div>
		<v-toolbar app color="primary" dark>
			<v-toolbar-title class="mx-auto" v-if="$store.state.showToolbarTitles">Checkout Success</v-toolbar-title>
		</v-toolbar>
		<v-container class="pa-0 pt-3 ma-0" grid-list-xs fluid>
			<div>
				<CheckMark />
				<div v-if="!$route.params.forOfflineContact">
					<div v-if="$store.getters['accounts/user'].type === 'Customer'">
						<p class="text-xs-center primary--text headline mt-3 mb-1">Thank you for your order!</p>
						<p class="text-xs-center body-1 mt-0">It has been forwarded to your reseller.</p>
					</div>
					<div v-else>
						<p class="text-xs-center primary--text headline mt-3 mb-1">Your order has been recorded!</p>
					</div>
				</div>
				<div v-else>
					<p class="text-xs-center primary--text headline mt-3 mb-1">
						Order placed for <br />{{$route.params.forOfflineContact.firstName}} {{$route.params.forOfflineContact.middleName || ''}} {{$route.params.forOfflineContact.lastName}}
					</p>
				</div>
				<v-divider class="mt-3"></v-divider>
				<div class="px-3 mt-3">
					<v-layout row wrap>
						<v-flex xs6>
							<div class="text-xs-left body-1">
								Order ID:
							</div>
						</v-flex>
						<v-flex xs6>
							<div class="text-xs-right body-2">
								{{order.orderNo}}
							</div>
						</v-flex>
					</v-layout>
					<v-layout row wrap class="mt-2">
						<v-flex xs6>
							<div class="text-xs-left body-1">
								Date:
							</div>
						</v-flex>
						<v-flex xs6>
							<div class="text-xs-right body-2">
								{{order.created_at | momentify('DD-MMM-YYYY')}}
							</div>
						</v-flex>
					</v-layout>
					<v-layout row wrap class="mt-2">
						<v-flex xs6>
							<div class="text-xs-left body-1">
								Total:
							</div>
						</v-flex>
						<v-flex xs6>
							<div class="text-xs-right body-2">
								{{order.total | currency('P')}}
							</div>
						</v-flex>
					</v-layout>
				</div>
				<div class="text-xs-center mt-3 px-5 mt-4">
					<v-btn block @click="goToOrder" depressed large color="grey" dark>View Order</v-btn>
					<v-btn block @click="backToCatalogue" depressed large color="primary" dark>Back to Products list</v-btn>
				</div>
			</div>
		</v-container>
	</div>
</template>



<script>
import {date} from '@/mixins/date'
import {mixins} from '@/mixins'
import {
	mapGetters
} from 'vuex'
import CheckMark from '@/components/CheckMark'
export default {
	data: () => ({
		order: {
			orderNo: null,
			created_at: null,
			total: null
		}
	}),
	components: {
		CheckMark
	},
	mounted () {
		if (this.$route.params.orderDetails) {
			this.order = Object.assign({}, {}, this.$route.params.orderDetails)
			console.log(this.order)
		}
	},
	methods: {
		goToOrder () {
			this.Indicator().open()
			this.$store.dispatch('orders/GET_ORDER', this.order.orderNo)
			.then((response) => {
				this.Indicator().close()
				this.$router.push({
					name: 'Order',
					params: {
						orderData: response,
						orderNo: response.orderNo
					}
				})
			})
		},
		backToCatalogue () {
			this.$router.push({name: 'Catalogue' });
		}
	},
	mixins: [date, mixins]
}
</script>

<style scoped>
</style>

