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
											<v-img :src="item.product.downloadURL" :alt="item.product.name" contain></v-img>
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
								<br>
								<a @click="editItem(item, i)">
									<v-icon class="caption blue--text">border_color</v-icon> Edit</a>
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
									Total
								</td>
								<td class="caption text-xs-right">
									{{GET_SUBTOTAL | currency('P')}}
								</td>
							</tr>
							<!-- <tr>
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
							</tr> -->
						</tbody>
					</table>
					<div class="text-xs-center mt-3">
						<v-btn @click="goToCheckout" depressed large color="primary" class="white--text" :disabled="GET_ITEMS.length < 1">
							<span v-if="GET_ITEMS.length > 0">Proceed to Checkout</span>
							<span v-else>Your basket is Empty</span>
						</v-btn>
					</div>
				</div>
			</v-container>
			<v-dialog v-model="editItemDialog" persistent>
				<v-card>
					<v-card-title class="pa-0">
						<v-btn icon @click="cancelEdit" class="primary--text">
							<v-icon>arrow_back</v-icon>
						</v-btn>
						<v-spacer></v-spacer>
						<v-btn @click="deleteItem" color="pink" depressed dark small> <v-icon left>delete_forever</v-icon> Delete</v-btn>
					</v-card-title>
					<v-card-text v-if="selected.product && selected.attribute">
						<div class="text-xs-center"  >
							<v-avatar tile size="70px">
								<img v-lazy="selected.product.imageObj" :alt="selected.product.name">
							</v-avatar>
							<div class="title">{{selected.product.name}}</div>
						</div>
						<v-container fluid>
							<v-layout row wrap v-if="!selected.product.attributes" align-center justify-center>
								<v-flex xs12>
									<v-layout row align-center justify-start>
										<v-flex xs8>
											<v-text-field
												:rules="numberRules"
												v-model="attribute.qty"
												label="Quantity"
											></v-text-field>
										</v-flex>

										<v-flex xs2 pa-2>
											<v-btn color="primary" icon :disabled="attribute.qty <= 0" @click="attribute.qty -= 1">
												<v-icon>remove</v-icon>
											</v-btn>
										</v-flex>

										<v-flex xs2 pa-2>
											<v-btn color="primary" icon @click="attribute.qty += 1">
												<v-icon>add</v-icon>
											</v-btn>
										</v-flex>
									</v-layout>
								</v-flex>
								<!-- <v-flex xs12>
									<v-select :items="['50ml', '100ml', '150ml', '200ml']" required
									:rules="basicRules" v-model="attribute.size" label="Size" single-line bottom></v-select>
								</v-flex> -->
								<!-- <v-flex xs12>
									<v-select
									label="Color"
									:items="['Red', 'Blue', 'Yellow', 'Green']"
									max-height="auto"
									v-model="attribute.color"
									required
									:rules="basicRules"
									>
									<template slot="item" slot-scope="data">
										<v-list-tile-action>
											<v-icon :color="`${data.item.toLowerCase()}`">fiber_manual_record</v-icon>
										</v-list-tile-action>
										<v-list-tile-content>
											<v-list-tile-title v-html="data.item"></v-list-tile-title>
										</v-list-tile-content>
									</template>
								</v-select>
							</v-flex> -->
						</v-layout>
						<v-layout row wrap v-else align-center justify-start>
							<v-flex xs12>
								<v-layout row>
									<v-flex xs8>
										<v-text-field
											:rules="numberRules"
											v-model="attribute.qty"
											label="Quantity"
										></v-text-field>
									</v-flex>

									<v-flex xs2 pa-2>
										<v-btn color="primary" icon :disabled="attribute.qty <= 0" @click="attribute.qty -= 1">
											<v-icon>remove</v-icon>
										</v-btn>
									</v-flex>

									<v-flex xs2 pa-2>
										<v-btn color="primary" icon @click="attribute.qty += 1">
											<v-icon>add</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
							</v-flex>
							
							<v-flex xs12 v-for="(a, index) in selected.product.attributes" :key="index">
								<v-select
								v-if="a.name == 'Color'"
								label="Color"
								:items="a.items"
								max-height="auto"
								v-model="attribute.color"
								required
								:rules="basicRules"
								>
								<template slot="item" slot-scope="data">
									<v-list-tile-action>
										<v-icon :color="`${data.item.toLowerCase()}`">fiber_manual_record</v-icon>
									</v-list-tile-action>
									<v-list-tile-content>
										<v-list-tile-title v-html="data.item"></v-list-tile-title>
									</v-list-tile-content>
								</template>
							</v-select>

							<v-select v-else :items="a.items" required :rules="basicRules" v-model="attribute[a.name.toLowerCase()]" :label="a.name" single-line bottom></v-select>
						</v-flex>
					</v-layout>
				</v-container>
				<div>
					<v-btn block depressed color="primary" @click="update">Update</v-btn>
				</div>
			</v-card-text>
		</v-card>
	</v-dialog>
	<v-snackbar v-model="basketSnackbar" bottom>
		{{basketSnackbarMsg}}
	</v-snackbar>
	 <v-dialog
      v-model="loader"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          Please stand by
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
	<BottomNav currentTab="orders" />
</div>
</template>





<script>
import { mapGetters } from 'vuex';
import { mixins } from '@/mixins';
import BottomNav from '@/components/BottomNav';
export default {
	mixins: [mixins],
	data: () => ({
		extended: false,
		search: null,
		editItemDialog: false,
		selected: {},
		basketSnackbar: false,
		basketSnackbarMsg: null,
		attribute: {
			qty: 0,
		},
		loader: false
	}),
	created() {
		this.cordovaBackButton(this.goBack);
		console.log(this.$route.params)
	},
	methods: {
		notify (msg) {
			this.basketSnackbar = true
			this.basketSnackbarMsg = msg
		},
		goBack () {
		// this.$router.push({name: 'Tabs', params: {tab: 'basket'}})
		const routeParams = this.$route.params;

		// for msa
		if (routeParams.route && routeParams.route.fullPath.includes('my-selling-assistant')) {
			// this.$router.push({name: this.$route.params.previousRoute});
			this.$router.go(-1);
			return;
		}

		if (routeParams && routeParams.previousTab) {
			// this.$router.push({name: 'Tabs', params: {tab: this.$route.params.previousTab}})
			this.$router.go(-1);
			return;
		}

		if (routeParams && routeParams.previousRoute) {
			this.$router.push({name: this.$route.params.previousRoute});
		} else {
			// if (routeParams && routeParams.from) {
			// 	this.$router.push({name: 'Tabs', params: {tab: routeParams.from}});
			// } else {
			// 	this.$router.push({name: 'Tabs', params: {tab: 'basket'}});
			// }
		}
	},
	goToCheckout () {
		this.$router.push({name: 'Checkout', params: {tab: 'basket', from: this.$route.params.previousTab}})
	},
	editItem (item, index) {
		this.loader = true;
		this.$store.dispatch('products/GET_PRODUCT', item.product.id)
		.then((res) => {
			this.loader = false;
			this.editItemDialog = true
			this.selected = Object.assign({}, item)
			this.selected.product = Object.assign({}, this.selected.product, res);
			if (this.selected.product.attributes) {
				this.selected.product.attributes.forEach((attrib) => {
					const attribName = attrib.name.toLowerCase();
					if (attribName === 'quantity') {
						this.attribute['qty'] = item.attribute['qty'];
					} else {
						this.attribute[attribName] = item.attribute[attribName];
					}
				})

				//delete the "quantity" attribute on the product
				const index = this.selected.product.attributes.findIndex((attrib) => attrib.name.toLowerCase() === 'quantity');
				if(index != -1) this.selected.product.attributes.splice(index, 1);
				
			} else {
				this.attribute = {
					qty: item.attribute.qty,
					size: item.attribute.size,
					color: item.attribute.color
				}
			}
			console.log('attribs', this.attribute)
		})
	},
	cancelEdit () {
		this.editItemDialog = false
		this.$store.dispatch('basket/GET_ITEMS')
		.then(() => {
			this.selected = {};
			this.attribute = {
				qty: 0,
			};
		})
	},
	update () {
		this.selected.attribute = Object.assign({}, this.selected.attribute, this.attribute);
		// console.log("THIS.SELECTED.ATTRIBUTE: ", this.selected.attribute);
		// console.log("THIS.ATTRIBUTE: ", this.attribute);

		if(this.selected.attribute.quantity) delete this.selected.attribute.quantity;

		this.$store.dispatch('basket/UPDATE_ITEM', this.selected)
		.then(() => {
			return this.$store.dispatch('basket/GET_ITEMS');
		})
		.then(() => {
			this.editItemDialog = false;
			this.selected = {};
			this.attribute = {
				qty: 0,
			};
			this.notify('Item has been updated');
		})
	},
	deleteItem () {
		this.$store.dispatch('basket/REMOVE_ITEM', this.selected._id)
		.then(() => {
			this.editItemDialog = false
			this.selected = {};
			this.attribute = {
				qty: 0,
			};
			this.notify('Item has been removed')
		})
	}
},
computed: {
	...mapGetters({
		GET_ITEMS: 'basket/GET_ITEMS',
		GET_SUBTOTAL: 'basket/GET_SUBTOTAL'
	}),
},
components: {BottomNav},
watch: {
	GET_ITEMS (val) {
		// if (val.length < 1) this.$router.push({name: 'Tabs', params: {tab: 'basket'}})
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
