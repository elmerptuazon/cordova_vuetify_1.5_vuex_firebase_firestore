<template>
	<div>
		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-text-field v-model="search" label="Search..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="search"></v-text-field>
			<BasketBadge tabName="msa" />
			<v-btn icon @click="openDialog">
				<v-icon>add</v-icon>
			</v-btn>
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Logo />
		</v-toolbar>

		<v-container class="pa-0">
			<div style="height: 85vh; width: 100%; overflow:auto;">
				<v-data-table
				:headers="headers"
				:items="items"
				:loading="loading"
				:search="search"
				:pagination.sync="pagination"
				hide-actions
				item-key="unique"
				>
					<template slot="headers" slot-scope="props">
						<tr>
							<th
							class="pa-0"
							v-for="header in props.headers"
							:key="header.text"
							:class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
							@click="changeSort(header.value)"
							>
							<v-icon small>arrow_upward</v-icon>
							
							<span v-if="header.text === 'Inventory'">
								My <br /> Inventory
							</span>
							<span v-else-if="header.text  === 'Orders'">
								Customer <br /> Orders
							</span>
							<span v-else>{{ header.text }}</span>
						</th>
					</tr>
					</template>
					<template slot="items" slot-scope="props">
						<tr @click="viewQuantity(props.item)" :class="[(props.item.inventory - props.item.orders) < 0 ? 'red white--text' : '']">
							<td class="text-xs-left pa-0 px-1 py-1">
								<v-avatar tile size="30px">
									<v-img :src="props.item.downloadURL" :alt="props.item.name" contain></v-img>
								</v-avatar>
							</td>
							<td class="text-xs-left px-0 thick" style="white-space: nowrap;">
								&nbsp; {{ props.item.name | truncate }}
								<br />
								<span class="caption">{{ props.item.attributes | joinAttributes }}</span>
							</td>
							<td class="text-xs-center pa-0 thick">
								&nbsp;&nbsp;&nbsp;{{ props.item.inventory }}
							</td>
							<td class="text-xs-center pa-0 thick">
								&nbsp;&nbsp;&nbsp;{{ props.item.orders }}
							</td>
							<td class="text-xs-center pa-0 thick">
								&nbsp;&nbsp;&nbsp;{{ props.item.net }}
							</td>
						</tr>
					</template>
				</v-data-table>
				<div class="px-2 mt-4">
					<v-btn @click="confirmGenerate" large color="primary" class="white--text" block>
						<span class="body-2">Order items you need from {{ $store.getters['GET_COMPANY'] }}</span>
					</v-btn>
				</div>
			</div>
		</v-container>

<v-dialog v-model="inventoryDialog" max-width="300">

	<v-card v-if="inventoryDialog">
		<v-form v-model="valid" ref="form" lazy-validation>
			<v-card-title class="title">
				Products
				<v-spacer></v-spacer>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text class="py-1">
				<v-autocomplete
				:items="productsList"
				label="Select a Product"
				item-value="id"
				item-text="name"
				v-model="selectedProduct.id"
				required
				:rules="basicRules"
				></v-autocomplete>
				<v-select v-if="hasVariant"
				:items="variantsList"
				label="Select a color"
				v-model="attributes.color"
				required
				:rules="basicRules"
				></v-select>
				<v-text-field 
					type="number" 
					label="Quantity" 
					v-model="selectedProduct.inventory"
					required
					:rules="numberRules"></v-text-field>
			</v-card-text>	
		</v-form>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn v-show="(selectedProduct.inventory === '0' && selectedProduct.orders === 0) || (selectedProduct.inventory === 0 && selectedProduct.orders === 0)" depressed class="red white--text" @click.native="confirmDeletion" :disabled="buttonLoading" :loading="buttonLoading">
				Delete
			</v-btn>
			<v-btn depressed class="primary white--text" @click.native="saveQuantity" :disabled="buttonLoading" :loading="buttonLoading">Save</v-btn>
		</v-card-actions>
	</v-card>
</v-dialog>

<v-dialog v-model="loaderDialog" hide-overlay persistent width="300">
			<v-card color="primary" dark>
				<v-card-text>
					{{loaderDialogMessage}}
					<v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
				</v-card-text>
			</v-card>
		</v-dialog>

<v-snackbar bottom right v-model="snackbar">
	Product quantity updated
</v-snackbar>
<BottomNav currentTab="msa" />

<ConfirmationModal ref="ConfirmationModal" @confirmClicked="deleteItem" />
<ConfirmationModal ref="GenerateStockOrderConfirmation" confirmText="Continue" @confirmClicked="generateStockOrder" />
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Spinner } from 'mint-ui';
import BottomNav from '@/components/BottomNav';
import BasketBadge from '@/components/BasketBadge';
import {mixins} from '@/mixins';
import ConfirmationModal from '@/components/ConfirmationModal';
import { COLLECTION } from '@/config/firebaseInit';
import products from '../store/modules/products';

export default {
	mixins: [mixins],
	data: () => ({
		extended: false,
		search: null,
		loading: false,
		headers: [
		{ text: '', value: 'unique', class: 'pa-0', sortable: false },
		{ text: 'Item', value: 'name', align: 'left', class: 'pa-0' },
		{ text: 'Inventory', value: 'inventory', align: 'left', class: 'pa-0' },
		{ text: 'Orders', value: 'orders', align: 'left', class: 'pa-0' },
		{ text: 'Net', value: 'net', align: 'left', class: 'pa-0' }
		],
		items: [],
		inventoryDialog: false,
		productsList: [],
		variantList:[],
		hasVariant: false,
		attributes: {},
		selectedProduct: {},
		snackbar: false,
		buttonLoading: false,
		pagination: {
			sortBy: 'net',
			rowsPerPage: 0
		},
		loaderDialog: false,
		loaderDialogMessage: null
	}),
	created () {
		this.generateInventory();
	},
	methods: {
		generateInventory(){
				this.loading = true;
			this.$store.dispatch('orders/GET_RESELLER_ORDERS', true)
			.then((data) => {

				const items = data.map((order) => {
					let placedOrders = order.orders.filter(item => item.status !== 'delivered');
					// let placedOrders = order.orders.map(item => item);
					return placedOrders.map(item => item.basket);
				});

				let flattened_items = [].concat.apply([], items);
				flattened_items = [].concat.apply([], flattened_items);

				const orders = [];

				flattened_items.forEach((item) => {
					// generate unique value based on product id and attributes
					const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
					delete itemAttributesCopy.qty;
					const attributes = Object.values(itemAttributesCopy).sort();
					const unique = item.product.id + '_' + attributes.join('-');
					// generate end
					const orderIndex = orders.findIndex(o => o.unique === unique);
					if (orderIndex >= 0) {
						orders[orderIndex].orders += item.attribute.qty;
						orders[orderIndex].net = (orders[orderIndex].inventory - orders[orderIndex].orders)
					} else {
						// generate unique value based on product id and attributes
						const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
						delete itemAttributesCopy.qty;
						const attributes = Object.values(itemAttributesCopy).sort();
						const unique = item.product.id + '_' + attributes.join('-');
						// generate end
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

				this.$store.dispatch('inventory/GET_INVENTORY')
				.then((res) => {
					const addedItemsFromCatalogue = [];

					res.forEach((inv) => {
						const productIndex = orders.findIndex(order => order.unique === inv.unique);
						if (productIndex >= 0) {
							orders[productIndex].inventory = inv.inventory;
							orders[productIndex].net = inv.inventory - orders[productIndex].orders;
							orders[productIndex].inventory_id = inv.inventory_id;
						} else {
							addedItemsFromCatalogue.push(
								this.$store.dispatch('products/GET_PRODUCT', inv.productId)
								.then((data) => {
									data.newItem = inv;
									return data;
								})
							);
						}
					});

					Promise.all(addedItemsFromCatalogue)
					.then((newItems) => {

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
							inv.inventory_id = inv.inventory_id;
							orders.push(inv);
						});

						this.loading = false;
						this.items = orders;
						console.log(this.items)
						// console.log(this.items)
						if (this.$route.params.docRef) {
							const itemIndex = this.items.findIndex(item => item.inventory_id === this.$route.params.docRef.id);
							if (itemIndex >= 0) {
								this.viewQuantity(this.items[itemIndex]);
							}
						}
					});
				})
			})
			.catch(error => {
				console.log(error);
			});
			COLLECTION.products.get().then(querySnapshot => {
				this.productsList = querySnapshot.docs.map(doc => {
				const data = doc.data();
					data.id = doc.id
					return data;
				});
				this.productsList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
			})
			

		},
		goBack () {
			this.$router.push({ name: 'MySellingAssistant' });
			// this.$router.push({ name: 'InventoryPages' });
		},
		async openDialog(){
		
			this.inventoryDialog = true;
			this.selectedProduct.inventory = null;
			this.selectedProduct.id = null;

		},
		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
		},
		viewQuantity (item) {
			this.selectedProduct = Object.assign({}, {}, item);
			this.inventoryDialog = true
		},
		confirmDeletion () {
			this.$refs.ConfirmationModal.show('Confirm Deletion', 'Are you sure you want to remove the item from view?');
		},
		deleteItem () {
			this.$refs.ConfirmationModal.close();
			this.buttonLoading = true;
			this.$store.dispatch('inventory/DELETE_INVENTORY_ITEM', this.selectedProduct.inventory_id)
			.then((res) => {
				if (res.success) {
					const index = this.items.findIndex(item => item.id === this.selectedProduct.id);
					this.items.splice(index, 1);
					this.inventoryDialog = false;
					this.buttonLoading = false;
				}
			})
			.catch((error) => {
				console.log(error);
				alert('An error occurred');
				this.inventoryDialog = false;
				this.buttonLoading = false;
			});
		},
		saveQuantity () {
			if(!this.$refs.form.validate()) {
				return;
			}
			this.buttonLoading = true;
			this.attributes.quantity = this.selectedProduct.inventory;
			this.$store.dispatch('inventory/ADD_TO_INVENTORY', {
			
			attributes: this.attributes,
			inventory: this.attributes['quantity'],
			net: 0,
			productId: this.selectedProduct.id,

			})
			.then((res) => {
				console.log(res)
				this.addToInventoryLoading = false;
				this.inventoryDialog = false;
				this.buttonLoading = false;
				if (res.exists) {
						console.log(this.selectedProduct)
						this.selectedProduct.unique = res.data.unique;
						this.selectedProduct.inventory_id  = res.data.id;
						this.selectedProduct.id = res.data.productId;
						this.$store.dispatch('inventory/UPDATE_INVENTORY_ITEM', {
						inventory_id: this.selectedProduct.inventory_id || null,
						quantity: this.selectedProduct.inventory,
						product_id: this.selectedProduct.id,
						unique: this.selectedProduct.unique,
						attributes: this.attributes
						
						})
						.then((res) => {
							console.log(res)
							const itemIndex = this.items.findIndex(item => item.unique === this.selectedProduct.unique);
							this.items[itemIndex].inventory = res.quantity;
							this.items[itemIndex].net = res.quantity - +this.items[itemIndex].orders;

							if (res.inventory_id) {
								this.items[itemIndex].inventory_id = res.inventory_id;
							}
							this.snackbar = true;
							this.inventoryDialog = false;
							this.buttonLoading = false;
						})
						.catch((error) => {
							console.log(error);
							alert('An error occurred');
							this.inventoryDialog = false;
							this.buttonLoading = false;
						});
								
				}
				else{
							
							this.snackbar = true;
							
							this.generateInventory();
							this.inventoryDialog = false;
							this.buttonLoading = false;
				}
				})
			
		},

		confirmGenerate () {
			this.$refs.GenerateStockOrderConfirmation.show('Confirm', `You are about to add products with a negative value in the NET column to your shopping cart. You still need to review your shopping cart and submit your order to ${this.$store.getters['GET_COMPANY']}.`);
		},

		generateStockOrder () {
			this.$refs.GenerateStockOrderConfirmation.close();
			this.loaderDialog = true;
			this.loaderDialogMessage = 'Generating orders';
			const includeSelfOrders = false;
			this.$store.dispatch('orders/GET_RESELLER_ORDERS', includeSelfOrders)
			.then((data) => {

				const items = data.map((order) => {
					let placedOrders = order.orders.filter(item => item.status !== 'delivered');
					return placedOrders.map(item => item.basket);
				});

				let flattened_items = [].concat.apply([], items);
				flattened_items = [].concat.apply([], flattened_items);

				const orders = [];

				flattened_items.forEach((item) => {
				// generate unique value based on product id and attributes
				const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
				delete itemAttributesCopy.qty;
				const attributes = Object.values(itemAttributesCopy).sort();
				const unique = item.product.id + '_' + attributes.join('-');
				// generate end
				const orderIndex = orders.findIndex(o => o.unique === unique);
				if (orderIndex >= 0) {
					orders[orderIndex].orders += item.attribute.qty;
					orders[orderIndex].net  = (orders[orderIndex].inventory - orders[orderIndex].orders);
				} else {
					// generate unique value based on product id and attributes
					const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
					delete itemAttributesCopy.qty;
					const attributes = Object.values(itemAttributesCopy).sort();
					const unique = item.product.id + '_' + attributes.join('-');
					// generate end
					orders.push({
						id: item.product.id,
						imageObj: item.product.imageObj,
						name: item.product.name,
						orders: item.attribute.qty,
						unique,
						attributes: item.attribute,
						inventory: 0,
						net: 0 - item.attribute.qty
					});
				}
			});

				this.$store.dispatch('inventory/GET_INVENTORY')
				.then((res) => {
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
								.then((data) => {
									data.newItem = inv;
									return data;
								})
								);
						}
					});

					Promise.all(addedItemsFromCatalogue)
					.then((newItems) => {

						newItems.forEach((item) => {
							const inv = JSON.parse(JSON.stringify(item.newItem));
							if (item.imageObj) {
								inv.imageObj = item.imageObj;
							} else {
								inv.downloadURL = item.downloadURL;
							}
						// inv.id = item.id;
						inv.name = item.name;
						inv.orders = 0;
						inv.inventory_id = inv.id;
						orders.push(inv);

					});

						this.loading = false;

						const negativeItems = orders.filter(order => order.net < 0).map((order) => {

							return {
								productId: order.id,
								qty: Math.abs(order.net),
								attributes: order.attributes,
							}

						});

						const obj = {
							items: negativeItems,
							createdAt: Date.now(),
							active: true
						}

						this.$store.dispatch('stock_orders/SAVE', obj)
						.then((res) => {

							// if (res.status == 'created') {

							// 	obj.id = res.id;
							// 	this.stockOrder.items = res.data.items;

							// } else if (res.status == 'updated') {

							// 	console.log(res)

							// 	this.stockOrder.items = res.items;

							// }
						})
						.catch((error) => {
							console.log(error);
						})
						.finally(() => {
							this.loaderDialog = false;
						});

					});
				})
			})
			.catch(error => {
				console.log(error);
			});
		}
	},
	computed: {
		...mapGetters({
			'GET_LIST': 'catalogues/GET_LIST',
			'GET_ITEMS': 'basket/GET_ITEMS'
		}),
		selectedProductAttributes () {
			const data = [];
			const attributes = this.selectedProduct.attributes;
			Object.keys(attributes).forEach((attrib) => {
				if (attrib !== 'qty' && attrib !== 'quantity') {
					data.push(`${attrib}: ${attributes[attrib]}`);
				}
			});
			return data.join(', ');
		}
	},
	filters: {
		joinAttributes (val) {
			const data = [];
			Object.keys(val).forEach((attrib) => {
				if (attrib !== 'qty' && attrib !== 'quantity') {
					if (val[attrib]) {
						data.push(`${attrib}: ${val[attrib]}`);
					}
				}
			});
			return data.join(', ');
		},
		truncate (val) {
			if (!val) {
				return;
			}

			const maxLength = 15; // maximum number of characters to extract

			//trim the string to the maximum length
			let trimmedString = val.substr(0, maxLength);

			//re-trim if we are in the middle of a word
			if (/\s/.test(trimmedString)) {
				trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
				return trimmedString += '...';
			} else {
				return trimmedString;
			}
			
		}
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge,
		BottomNav,
		ConfirmationModal
	},
	watch: {
		items (val) {
			this.pagination.rowsPerPage = val.length;
		},
		'selectedProduct.id' (val) {
			//this.selectedProduct = {};
			try{
				this.variantsList = this.productsList.filter(p => p.id === val)[0].attributes[1].items;
				this.hasVariant = true;
			}
			catch(e){
				this.hasVariant = false;
			}
		}
	}
}
</script>

<style scoped>
.thick {
  font-weight: bold;
}

.name-width {
  width: 50px;
}
</style>

