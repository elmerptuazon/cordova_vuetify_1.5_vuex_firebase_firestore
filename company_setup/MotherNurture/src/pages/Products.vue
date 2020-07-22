<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-text-field label="Search product..." clearable v-model="search" v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="search"></v-text-field>
			<BasketBadge tabName="categories" />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<ContactsBadge/>
			<Accounts />
		</v-toolbar>

		<v-container fluid>

			<div class="text-xs-center mt-5" v-if="loader">
				<v-progress-circular :size="100" :width="5" color="primary" indeterminate></v-progress-circular>
			</div>

			<div class="text-xs-center grey--text text--darken-2 body-2" v-show="noItemsMessage">
				Catalogue has no items.
			</div>

			<!-- <div class="products-container">
				<div class="product-item mb-3" v-for="c in filterBy(GET_PRODUCTS, search)" :key="c.id" @click="goToProduct(c)">
					<v-card ripple>
						<div class="pa-2">
							<v-img :src="c.downloadURL" :lazy-src="require('@/assets/placeholder.png')" contain :aspect-ratio="4/3">
								<v-layout
								slot="placeholder"
								fill-height
								align-center
								justify-center
								ma-0
								>
								<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
							</v-layout>
						</v-img>
					</div>
					<div class="card-title pl-2 pb-2 pr-2 pt-0 mt-0 grey--text text--darken-2">
						{{c.name}}
						<br>
						<div style="font-weight: bold;">{{c.price | currency('P ')}}</div>
					</div>
				</v-card>
			</div>
		</div> -->

			<masonry :cols="2" :gutter="8">
				<v-card class="mb-2" v-for="product in filterBy(GET_PRODUCTS, search)" :key="product.id" @click="goToProduct(product)">
					<div>
						<v-img contain :src="product.downloadURL" :lazy-src="require('@/assets/placeholder.png')">
							<v-layout slot="placeholder" fill-height align-center justify-center ma-0>
								<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
							</v-layout>
						</v-img>
					</div>
					<div class="card-title pa-2 grey--text text--darken-2">
						<div>{{product.name}}</div>
						<div style="font-weight: bold;">{{product.price | currency('P')}}</div>
					</div>
					
				</v-card>
			</masonry>

	</v-container>
	<BottomNav currentTab="categories" />
</div>
</template>


<script>
import {mapGetters} from 'vuex'
import {mixins} from '@/mixins'
import { Spinner } from 'mint-ui'
import BottomNav from '@/components/BottomNav'
import BasketBadge from '@/components/BasketBadge'
import ContactsBadge from '@/components/ContactsBadge'

export default {
	mixins: [mixins],
	data: () => ({
		extended: false,
		search: '',
		isLoading: false,
		snackbar: false,
		message: null,
		catalogueName: null,
		loader: false,
		items: [],
		noItemsMessage: false
	}),
	watch: {
		GET_PRODUCTS (val) {
			if (val.length > 0) {
				this.loader = false
			}
		}
	},
	methods: {
		onRefresh () {},
		goToProduct (product) {
			this.$router.push({name: 'Item', params: {id: product.id, product, category: this.$route.params.id}});
		},
		goBack () {
			this.$router.go(-1);
		},
		isLowInStocks(product) {
			return product.availableQTY <= product.reOrderLevel;
		},
	},
	created () {

		if (this.GET_PRODUCTS.length < 1) {
			this.loader = true
		}

		if (this.$route.params.id) {
			this.$store.dispatch('products/GET_PRODUCTS', this.$route.params.id)
			.then((data) => {
				this.loader = false;
				this.items = data;

				if (this.items.length === 0) {
					this.noItemsMessage = true;
				} else {
					this.noItemsMessage = false;
				}
			});
		} else {
			this.items = this.$store.getters['products/GET_PRODUCTS'];
			console.log(this.items)
			if (this.items.length === 0) {
				this.noItemsMessage = true;
			} else {
				this.noItemsMessage = false;
			}
		}

		this.cordovaBackButton(this.goBack);

	},
	mounted() {
		this.catalogueName = this.$route.params.catalogueName
	},
	computed: {
		...mapGetters({
			// GET_PRODUCTS: 'products/GET_PRODUCTS',
			GET_CURRENT_CATALOGUE: 'GET_CURRENT_CATALOGUE',
			user: 'accounts/user'
		}),
		GET_PRODUCTS () {
			return this.items;
		}
	},
	components: {
		'mt-spinner': Spinner,
		BottomNav,
		BasketBadge,
		ContactsBadge
	}
}

</script>

<style scoped>
.card-img-container {
	position: relative;
}

.card-img {
	height: 100%;
	width: 100%;
	max-width: 100%;
	max-height: 100%;
}

.card-title {
	width: 100%;
	font-size: 15px;
}

.spinner-position {
	position: absolute;
	left: 50%;
	top: 50%;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}

.products-container {
	column-count: 2;
	column-gap: 3;
	width: 100%;
}

.product-item {
	display:inline-block;
	margin:0 0 1px 0;
	padding:0;
	width: 100%;
	max-width: 100%;
}

</style>

