<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Stock Orders</v-toolbar-title>
			<v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
			<BasketBadge tabName="msa" />
			<v-spacer></v-spacer>
			<Accounts />
		</v-toolbar>

		<v-container class="pa-0">

			<div class="text-xs-center mt-5" v-if="loading">
				<v-progress-circular :size="100" :width="5" color="primary" indeterminate></v-progress-circular>
			</div>

			<v-list three-line v-if="!loading">

				<v-subheader>Stock Orders</v-subheader>

				<v-divider></v-divider>

				<v-list-tile @click="viewStockOrder(item)" ripple v-for="item in orderBy(items, 'submittedAt', -1)" :key="item.id" ripple>
					<v-list-tile-content>
						<v-list-tile-title>{{ item.submittedAt | momentify('MMMM D YYYY, h:mm a') }}</v-list-tile-title>
						<v-list-tile-sub-title>Total: {{ item.total | currency('P') }}</v-list-tile-sub-title>
						<v-list-tile-sub-title>
							<div v-if="item.status === 'pending'">Status: <span>PENDING</span></div>
							<div v-else-if="item.status === 'delivered'">Status: <span class="green--text">DELIVERED</span></div>
							<div v-else-if="item.status === 'collected'">Status: <span class="green--text">COLLECTED</span></div>
						</v-list-tile-sub-title>
					</v-list-tile-content>
					<v-list-tile-action>
						<v-btn icon ripple>
							<v-badge color="red" left overlap>
								<span slot="badge">{{ item.items.length }}</span>
								<v-icon color="grey lighten-1">shopping_cart</v-icon>
							</v-badge>
						</v-btn>
					</v-list-tile-action>
				</v-list-tile>

			</v-list>

		</v-container>

		<BottomNav currentTab="msa" />
	</div>
</template>




<script>
import { mapGetters} from 'vuex';
import { mixins } from '@/mixins';
import BottomNav from '@/components/BottomNav';
import BasketBadge from '@/components/BasketBadge';
import {date} from '@/mixins/date';

export default {
	mixins: [mixins, date],
	data: () => ({
		items: [],
		loading: false,
	}),
	created () {
		this.cordovaBackButton(this.goBack);
		this.fetchStockOrders();
	},
	methods: {
		goBack () {
			this.$router.push({ name: 'InventoryPages' });
		},
		newStockOrder() {
			this.$router.push({name: 'NewStockOrder'});
		},
		async fetchStockOrders () {
			this.loading = true;

			try {
				const response = await this.$store.dispatch('stock_orders/FIND_ALL');
				if (response.success) {
					this.items = response.data.map((data) => {
						data.total = data.items.reduce((a, b) => a + b.total, 0);
						return data;
					});

					console.log(response.data)
				}
			} catch (error) {
				console.log(error);
			}

			this.loading = false;
		},
		viewStockOrder ({id}) {
			this.$router.push({name: 'ViewStockOrder', params: {id}})
		}
	},
	components: {
		BasketBadge
	}
}

</script>

<style scoped>
</style>

