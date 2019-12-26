<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Products</v-toolbar-title>
			<v-text-field v-model="search" label="Search product..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="search"></v-text-field>
			<BasketBadge tabName="msa" />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Accounts />
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
				<div style="width: 60px;" class="text-xs-center">{{m.name}}</div>
			</v-chip>
		</div>
	</v-container>
	<v-data-table
	:headers="headers"
	:items="items"
	hide-actions
	:search="search"
	:loading="loading"
	:pagination.sync="pagination"
	>
	<template slot="headers" slot-scope="props">
		<tr>
			<th
			class="pa-1 text-xs-left"
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
		<td class="text-xs-left pa-1">
			<div style="float: left;">
				<v-avatar size="42px" tile>
				<img 
				v-lazy="props.item.info.imageObj"
				class="thin-border"
				/>
				</v-avatar>
			</div>
			<div style="margin-left: 50px;">
				{{ props.item.name }}
				<br />
				<span class="caption">
					{{ props.item.attributes | joinAttributes }}
				</span>
			</div>
		</td>
		<td class="text-xs-right">{{ props.item.value | currency('P') }}</td>
		<td class="text-xs-right">{{ props.item.items }}</td>
	</template>
</v-data-table>
<div style="height: 20px;"></div>
<BottomNav currentTab="msa" />
</div>
</template>

<script>
import {mapGetters} from 'vuex';
import {mixins} from '@/mixins';
import { Spinner } from 'mint-ui';
import BottomNav from '@/components/BottomNav';
import BasketBadge from '@/components/BasketBadge';
export default {
	mixins: [mixins],
	data: () => ({
		snackbar: false,
		snackbarMsg: null,
		menu:
		[
		// {
		// 	name: 'Week',
		// 	color: 'white',
		// 	outline: false
		// },
		{
			name: 'Month',
			color: 'white',
			outline: false
		},
		{
			name: 'Quarter',
			color: 'primary',
			outline: true
		}
		],
		selected: 'Month',
		headers: [
		{ text: 'Top 10 Products', value: 'name', align: 'center', class: 'pa-0' },
		{ text: 'by PHP value', value: 'value', align: 'center', class: 'pa-0' },
		{ text: 'by # of items', value: 'items', align: 'center', class: 'pa-0' }
		],
		items: [],
		extended: false,
		loading: false,
		search: null,
		pagination: {
			sortBy: 'net',
			rowsPerPage: 0
		}
	}),
	created () {
		this.cordovaBackButton(this.goBack);
		this.fetchProducts(this.selected)
	},
	methods: {
		goBack () {
			this.$router.push({name: 'SalesPerformance'});
		},
		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
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
		fetchProducts(selected) {
			this.loading = true;
			this.$store.dispatch('products/GET_ALL_PRODUCTS', {selected})
			.then((data) => {
				this.loading = false;
				const products = [];

				data.forEach((p) => {
					const index = products.findIndex(product => product.id === p.product.id);
					if (index === -1) {
						products.push({
							id: p.product.id,
							name: p.product.name,
							info: p.product,
							value: p.attribute.qty * p.product.price,
							items: p.attribute.qty,
							attributes: p.attribute
						});
					} else {
						products[index].value += (p.attribute.qty * p.product.price);
						products[index].items += p.attribute.qty;
					}
				});

				this.items = products;
			})
		},
		getSmallSize ({width, height}) {
			const size = this.calculateAspectRatioFit(+width, +height, 42, 42);
			size.width = size.width + 'px';
			size.height = size.height + 'px';
			return size;
		}
	},
	computed: {
		...mapGetters({
			'GET_LIST': 'catalogues/GET_LIST',
			'GET_ITEMS': 'basket/GET_ITEMS'
		})
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge,
		BottomNav
	},
	watch: {
		selected (val) {
			this.fetchProducts(val);
		},
		items (val) {
			this.pagination.rowsPerPage = val.length;
		}
	},

	filters: {
		joinAttributes (val) {
			console.log(val)
			const attributes = JSON.parse(JSON.stringify(val));
			delete attributes.qty;
			delete attributes.quantity;

			const keys = Object.keys(attributes);

			let str = '';

			keys.forEach((key) => {
				str += `${key}:${attributes[key]}`;
			});

			return str;
		}
	}
}

</script>

<style scoped>
.thin-border {
	border: 1px solid #021a40;
}
</style>