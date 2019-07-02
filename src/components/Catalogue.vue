<template>
	<div>
		<v-toolbar app color="primary" dark :extended="extended" v-if="$store.state.rightAlignToolbarIcons">
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Catalogue</v-toolbar-title>
			<Logo />
			<v-spacer></v-spacer>
			<v-text-field label="Search category..." clearable v-model="search" v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="arrow_back"></v-text-field>
			<BasketBadge tabName="categories" />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
		</v-toolbar>

		<v-toolbar app color="primary" dark :extended="extended" v-else>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Catalogue</v-toolbar-title>
			<v-text-field label="Search category..." clearable v-model="search" v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="arrow_back"></v-text-field>
			<BasketBadge tabName="categories" />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Logo />
		</v-toolbar>

		<v-container grid-list-lg>
			<div class="spinner-position" v-show="loading">
				<mt-spinner type="snake" color="#1976D2" :size="40"></mt-spinner>
			</div>
			<!-- <van-pull-refresh v-model="isLoading" @refresh="onRefresh" pulling-text="Pull to Refresh" loosing-text="Loose to Refresh" loading-text="Loading..." :head-height="50"> -->
				<v-layout row wrap>
					<v-flex :class="[c.fullWidth ? 'xs12' : 'xs6']" v-for="c in filterBy(GET_LIST, search)" :key="c.id" @click="goToProducts(c)">
						<v-card ripple style="height: 100%;" class="card-img-container">
							<div style="height: 100px;">
								<img v-lazy="c.imageObj" :alt="c.id" class="card-img" />
							</div>
							<div class="card-title title">{{c.name}}</div>
						</v-card>
					</v-flex>
				</v-layout>
				<!-- <van-notice-bar v-show="GET_LIST.length > 0" mode="closeable" color="#FFF" background="#2196F3" scrollable class="mt-2">
					Christmas Sale! Get up to 50% discount when you buy the latest make up kit by John Doe...
				</van-notice-bar>
			</van-pull-refresh> -->
		</v-container>

		<v-snackbar :timeout="3000" top right v-model="snackbar">
			{{message}}
			<v-btn flat color="blue" @click.native="snackbar = false">Close</v-btn>
		</v-snackbar>

	</div>
</template>




<script>
import {mapGetters} from 'vuex';
import { Spinner } from 'mint-ui';
import BasketBadge from '@/components/BasketBadge';
import {mixins} from '@/mixins';
export default {
	data: () => ({
		imageLoaded: false,
		extended: false,
		search: '',
		isLoading: false,
		snackbar: false,
		message: null,
		loading: false,
		GET_LIST: []
	}),
	created () {
		this.$store.dispatch('basket/GET_ITEMS');

		if (this.GET_LIST.length === 0) {
			this.loading = true;
		}

		this.$store.dispatch('catalogues/GET_LIST')
		.then((items) => {
			this.loading = false;
		})
		.catch((error) => {
			console.log(error);
		});

		this.$Lazyload.$on('loaded', ({el, src}) => {
			this.$store.commit('catalogues/SET_IMAGE_LOADED', el.alt);
		});
	},
	beforeDestroy () {
		this.$Lazyload.$off('loaded')
	},
	methods: {
		onRefresh () {
			this.$store.dispatch('catalogues/GET_LIST').then(() => {
				this.isLoading = false;
				this.message = 'Catalogue successfully updated.';
				this.snackbar = true;
			});
		},
		goToProducts(catalogue) {
			// this.$store.dispatch('products/GET_PRODUCTS', catalogue.id);
			this.$store.commit('SET_CURRENT_CATALOGUE', catalogue.name);
			this.$router.push({name: 'Products', params: { id: catalogue.id } });
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
			'GET_ITEMS': 'basket/GET_ITEMS'
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
.card-img-container {
	position: relative;
	text-align: center;
	/*display: flex;*/
}

.card-img {
	height: 100%;
	width: 100%;
	max-width: 100%;
	max-height: 100%;
}

.card-title {
	position: absolute;
	top: 36%;
	width: 100%;
	color: #fff;
	text-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
}

.spinner-position {
	position: absolute;
	left: 50%;
	top: 50%;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}

</style>

