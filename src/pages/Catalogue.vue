<template>
	<div>

		<v-toolbar app color="primary" dark :extended="extended">
			<v-text-field label="Search products..." clearable v-model="search" v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			append-outer-icon="search" @click:append-outer="searchProduct" @keyup.enter="searchProduct"></v-text-field>
			<BasketBadge/>
			<v-btn icon @click="showSearch">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Logo />
		</v-toolbar>

		<v-container fluid>

			<div class="text-xs-center mt-5" v-if="loading">
				<v-progress-circular :size="100" :width="5" color="primary" indeterminate></v-progress-circular>
			</div>

			<v-layout row wrap v-if="search">
				<v-flex v-if="!searchedProducts"> 
					<div class= "title grey--text lighten-2 text-center">
						No results...
					</div>
				</v-flex>
				<v-flex v-else grow xs6 v-for="product in searchedProducts" :key="product.id" @click="goToSearchedProduct(product)">
					<v-card class="mb-1">
						<v-layout row>
							<v-img contain :src="product.downloadURL" :lazy-src="require('@/assets/placeholder.png')">
								<v-layout slot="placeholder" fill-height align-center justify-center ma-0>
									<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
								</v-layout>
							</v-img>
						</v-layout>
						<v-layout row>
							<div class="card-title pa-2 grey--text darken-2">{{product.name}}</div>
							<br>
							<div style="font-weight: bold;">{{product.price | currency('P')}}</div>
						</v-layout>
					</v-card>
				</v-flex>
			</v-layout>

			<masonry v-else :cols="1" :gutter="8">
				<v-card class="mb-2" v-for="c in GET_LIST" :key="c.id" @click="goToProducts(c)">
					<v-img contain :src="c.downloadURL" :lazy-src="require('@/assets/placeholder.png')">
						<v-layout slot="placeholder" fill-height align-center justify-center ma-0>
							<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
						</v-layout>
					</v-img>
				</v-card>
			</masonry>

		</v-container>

		<v-snackbar :timeout="3000" top right v-model="snackbar">
			{{message}}
			<v-btn flat color="blue" @click.native="snackbar = false">Close</v-btn>
		</v-snackbar>

		<BottomNav currentTab="categories" />

	</div>
</template>


<script>
import {mapGetters} from 'vuex';
import {mapState} from 'vuex';
import { Spinner } from 'mint-ui';
import BasketBadge from '@/components/BasketBadge';
import {mixins} from '@/mixins';

export default {
	data: () => ({
		items: [],
		imageLoaded: false,
		extended: false,
		search: '',
		isLoading: false,
		snackbar: false,
		message: null,
		loading: false,
		//searchedProducts: [],
	}),
	created () {
		this.search = this.$store.getters['products/GET_PRODUCT_QUERY'];
		if(this.search) {
			this.extended = true;
		} else {
			this.extended = false;
			this.$store.commit('products/CLEAR_SEARCHED_PRODUCTS');
		} 

		this.$store.dispatch('basket/GET_ITEMS');

		if (this.GET_LIST.length === 0) {
			this.loading = true;
		}

		this.$store.dispatch('catalogues/GET_LIST')
		.then(() => {
			console.log('catalogue loaded');
		})
		.catch((error) => {
			console.log(error);
		})
		.finally(() => {
			this.loading = false;
		});
	},
	methods: {
		onRefresh () {
			this.$store.dispatch('catalogues/GET_LIST').then(() => {
				this.isLoading = false;
				this.message = 'Catalogue successfully updated.';
				this.snackbar = true;
			});
		},
		async searchProduct() {
			this.loading = true;
			let search = this.search;

			await this.$store.dispatch("products/SEARCH_PRODUCTS", search);
		
			this.loading = false;
		},
		goToProducts(catalogue) {
			// this.$store.dispatch('products/GET_PRODUCTS', catalogue.id);
			this.$store.commit('SET_CURRENT_CATALOGUE', catalogue.name);
			this.$router.push({name: 'Products', params: { id: catalogue.id } });
		},
		goToSearchedProduct(product) {
			console.log(product);
			//this.$store.commit('SET_CURRENT_CATALOGUE', product.category);
			this.$router.push({name: 'Item', params: {id: product.id, product, category: product.category}});
		},
		showSearch() {
			this.extended = !(this.extended);

			if(this.extended === false) {
				this.search = '';
				this.$store.commit('products/SET_PRODUCT_QUERY', this.search);
				this.$store.commit('products/CLEAR_SEARCHED_PRODUCTS')
			}
		},
		lsTest () {
			this.$store.dispatch('basket/ADD_ITEM', {
				name: 'Shampoo',
				price: 24,
				created_at: Date.now
			});
		}
	},
	computed: {
		...mapGetters({
			'GET_LIST': 'catalogues/GET_LIST',
			'GET_ITEMS': 'basket/GET_ITEMS'
		}),

		...mapState("products", {
			searchedProducts: state => state.searchedProducts 
		})
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge
	},
	mixins: [mixins]
}

</script>

<style scoped>
.spinner-position {
	position: absolute;
	left: 50%;
	top: 50%;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}

.card-title {
	position: absolute;
	top: 36%;
	width: 100%;
	color: #fff;
	background: rgba(0, 0, 0, 0.30);
}

.catalogue-container {
	-webkit-column-count: 2;
	-webkit-column-gap: 7px;
	column-count: 2;
	column-gap: 7px;
	width: 100%;
	margin: 0 auto;
}

.catalogue-item {
	margin-bottom: -7px;
	padding: 0;
	display: inline-block;
	width: 100%;
	text-align: center;
}

</style>

