<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">{{GET_CURRENT_CATALOGUE}}</v-toolbar-title>
			<BasketBadge tabName="categories" />
			<v-btn icon @click="shareProduct">
				<v-icon>share</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Logo />
		</v-toolbar>

		<div class="text-xs-center mt-5" v-if="!product.id">
			<v-progress-circular :size="100" :width="5" color="primary" indeterminate></v-progress-circular>
		</div>

		<div v-else>

			<v-container fluid class="grey--text text--darken-2" grid-list-md>

				<div class="white mb-2">
					<div style="width: 200px; max-width: 200px; margin: 0 auto;">
						<v-img :src="product.downloadURL" height="200" contain>
							<v-layout slot="placeholder" fill-height align-center justify-center ma-0>
								<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
							</v-layout>
						</v-img>
					</div>
				</div>

				<img id="hidden-thumbnail" :src="product.downloadURL" v-show="hideProductThumbnail" />
				<canvas id="thumbnail-canvass" v-show="hideProductThumbnail" />

				<p class="grey--text text--darken-2 product-price pb-0 mb-2">
					SRP: {{product.price | currency('&#8369;')}} <span v-show="user.type === 'Reseller'">&nbsp;&nbsp; Distr. Price: {{product.resellerPrice || product.price | currency('&#8369;')}}</span>
				</p>
				<p class="product-name pt-0 mb-2">{{product.name}}</p>
					<div v-if="product.description">
						<p class="product-description"  v-if="showMoreDescription">
							{{ product.description }}
							<a @click="showMoreDescription = false">Show less</a> or <a @click="copyText" class="pink--text">Copy text</a>
						</p>
						<p class="product-description" v-else>
							{{ product.description | trunc }} <a @click="showMoreDescription = true">Show more</a>
						</p>
					</div>
					<v-layout row wrap>
						<v-flex xs6>
							<v-btn block depressed class="primary white--text button-font" disabled>
								<v-icon left class="icon-font">email</v-icon> Send to chat
							</v-btn>
						</v-flex>
						<v-flex xs6>
							<v-btn v-if="user.type === 'Customer'" block depressed color="primary" class="white--text button-font" @click="openItemDialog('Customer')">
								<v-icon left class="icon-font">shopping_basket</v-icon> Add to basket
							</v-btn>
							<v-btn v-else block depressed color="primary" class="white--text button-font" @click="openItemDialog('Customer')">
								<v-icon left class="icon-font">shopping_basket</v-icon> Add to basket
							</v-btn>
						</v-flex>
						<v-flex xs6 v-if="user.type === 'Reseller'">
							<v-btn class="pink white--text button-font" block @click="openItemDialog('Inventory')">
								<v-icon left class="icon-font">add</v-icon> Inventory
							</v-btn>
						</v-flex>
						<v-flex xs6 v-if="user.type === 'Reseller'">
							<v-btn class="pink white--text button-font" block @click="openItemDialog('Stock Order')">
								<v-icon left class="icon-font">add</v-icon> Stock Order
							</v-btn>
						</v-flex>
					</v-layout>
				</v-container>
			</div>

			<v-dialog v-model="basketConfirmationDialog" width="250">
				<v-card>
					<v-card-text>
						<div class="headline text-xs-center blue--text text--darken-2">
							{{basketConfirmationDialogText}}
						</div>
						<checkmark />
					</v-card-text>
				</v-card>
			</v-dialog>

			<v-snackbar :timeout="3000" menu-props="bottom" multi-line v-model="snackbar">
				{{snackbarMessage}}
				<v-btn flat color="blue darken-2" @click.native="snackbar = false">Close</v-btn>
			</v-snackbar>

			<BottomNav currentTab="categories" />

			<v-dialog v-model="addBasketToContactDialog" fullscreen transition="dialog-bottom-transition" :overlay="false">
				<v-card>
					<ContactSelection @CLOSEDIALOG="addBasketToContactDialog = false" @SELECTEDCONTACT="addToOfflineContactBasket"/>
				</v-card>
			</v-dialog>

			<v-bottom-sheet v-model="socialSheet">
				<v-card>
					<v-card-title>
						<div class="title">Share via</div>
					</v-card-title>
					<v-card-text>
						<SocialShare @share="share" />
					</v-card-text>
				</v-card>
			</v-bottom-sheet>

			<v-dialog v-model="noticeDialog" max-width="290" persistent>
				<v-card>
					<v-card-title class="headline">Notice</v-card-title>
					<v-card-text>
						Facebook and Instagram no longer permits prefilling a message. We've already added the message to the clipboard for you. Just paste the content.
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="pink" flat="flat" @click.native="shareProduct(currentSocial)">Okay</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="editItemDialog" persistent>
				<v-card>
					<v-card-title class="pa-0">
						<v-btn icon @click="cancelEdit" class="primary--text">
							<v-icon>arrow_back</v-icon>
						</v-btn>
					</v-card-title>
					<v-card-text class="pa-0">
						<v-container fluid>
							<v-form v-model="valid" ref="form" lazy-validation>
								<v-layout row wrap v-if="!product.attributes">
									<v-flex xs12>
										<v-select
										v-if="selectedButton === 'Inventory'"
										:items="[1, 2, 3, 4, 5, 6, 7]"
										label="Quantity"
										v-model="attribute.qty"
										single-line
										menu-props="bottom"
										v-show="false"
										></v-select>
										<v-select
										v-else
										:items="[1, 2, 3, 4, 5, 6, 7]"
										required
										:rules="basicRules"
										label="Quantity"
										v-model="attribute.qty"
										single-line
										menu-props="bottom"
										></v-select>
									</v-flex>
									<v-flex xs12>
										<v-select :items="['50ml', '100ml', '150ml', '200ml']" required
										:rules="basicRules" v-model="attribute.size" label="Size" single-line menu-props="bottom"></v-select>
									</v-flex>
									<v-flex xs12>
										<v-select
										label="Color"
										:items="['Red', 'Blue', 'Yellow', 'Green']"
										:menu-props="{maxHeight:'auto'}"
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
								</v-flex>
							</v-layout>
							<v-layout row wrap v-else>
								<v-flex xs12 v-for="(a, index) in product.attributes" :key="index">
									<v-select
									v-if="a.name === 'Color'"
									label="Color"
									:items="a.items"
									:menu-props="{maxHeight:'auto'}"
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

								<v-select v-else-if="a.name === 'Quantity' && selectedButton === 'Inventory'" :items="a.items" v-model="attribute[a.name.toLowerCase()]" :label="a.name" single-line menu-props="bottom" v-show="false"></v-select>

								<v-select v-else :items="a.items" required :rules="basicRules" v-model="attribute[a.name.toLowerCase()]" :label="a.name" single-line menu-props="bottom"></v-select>
							</v-flex>
						</v-layout>
					</v-form>
					<div>
						<div v-if="selectedButton === 'Customer'">
							<v-btn v-if="user.type === 'Customer'" block depressed color="primary" class="white--text" @click="addToBasket">
								<v-icon left>add_shopping_cart</v-icon> Add to basket
							</v-btn>
							<v-btn v-else block depressed color="primary" class="white--text" @click="showBasketDialog">
								<v-icon left>add_shopping_cart</v-icon> Add to basket
							</v-btn>
						</div>
						<div v-else-if="selectedButton === 'Inventory'">
							<v-btn class="pink white--text" block @click="addToInventory" :disabled="addToInventoryLoading" :loading="addToInventoryLoading">
								<v-icon left>add</v-icon> Add to inventory
							</v-btn>
						</div>
						<div v-else-if="selectedButton === 'Stock Order'">
							<v-btn class="pink white--text" block @click="addToStockOrder" :disabled="addToStockOrderLoading" :loading="addToStockOrderLoading">
								<v-icon left>add</v-icon> Add to Stock Order
							</v-btn>
						</div>
					</div>
				</v-container>
			</v-card-text>
		</v-card>
	</v-dialog>
	<Modal ref="modal" />
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import {mixins} from '@/mixins';
import { Spinner } from 'mint-ui';
import BottomNav from '@/components/BottomNav';
// import truncate from 'vue-truncate-collapsed';
import CheckMark from '@/components/CheckMark';
import ContactSelection from '@/components/ContactSelection';
import BasketBadge from '@/components/BasketBadge';
import SocialShare from '@/components/SocialShare';
import Modal from '@/components/Modal';
const loading = require('../../static/img/spinner.gif');
const placeholder = require('../../static/img/item-placeholder.png');
import { AUTH } from '@/config/firebaseInit';

export default {
	mixins: [mixins],
	data: () => ({
		isLoading: false,
		message: null,
		product: {},
		basketConfirmationDialog: false,
		hideProductThumbnail: false,
		snackbar: false,
		snackbarMessage: null,
		attribute: {},
		addBasketToContactDialog: false,
		basketConfirmationDialogText: 'Item Added to Basket!',
		basicRules: [v => !!v || 'Required'],
		valid: true,
		socialSheet: false,
		noticeDialog: false,
		currentSocial: null,
		editItemDialog: false,
		selectedButton: null,
		showMoreDescription: false,
		addToInventoryLoading: false,
		addToStockOrderLoading: false
	}),
	methods: {
		goBack() {
			this.$router.go(-1);
		},

		openBasketConfirmationDialog(text = 'Item Added to Basket!') {
			this.basketConfirmationDialog = true;
			this.basketConfirmationDialogText = text;
			this.attribute = {
				qty: 0,
				size: null,
				color: null
			}
			this.editItemDialog = false;
		},

		openItemDialog(selected) {
			if (this.user.type === 'Customer' && !this.user.resellerId) {
				this.$refs.modal.show('Sorry', 'Please choose a reseller in order to be able to place an order.');
				return;
			}

			this.selectedButton = selected;
			this.editItemDialog = true;
		},

		addToBasket() {

			if(!this.$refs.form.validate()) {
				return;
			}

			const product = Object.assign({}, this.product)

			if (this.attribute['quantity']) {
				this.attribute['qty'] = this.attribute['quantity']
				delete this.attribute['quantity']
			}

			const item = {
				product,
				attribute: this.attribute
			}

			this.$store.dispatch('basket/ADD_ITEM', item)
			.then(() => {
				this.openBasketConfirmationDialog()
			})
		},
		showBasketDialog () {
			if(!this.$refs.form.validate()) {
				return false;
			}

			this.addBasketToContactDialog = true;
		},
		addToOfflineContactBasket(data) {

			if(!this.$refs.form.validate()) {
				return false;
			}

			const product = Object.assign({}, this.product)

			if (this.attribute['quantity']) {
				this.attribute['qty'] = this.attribute['quantity']
				delete this.attribute['quantity']
			}


			const item = {
				product,
				attribute: this.attribute
			}

			if (data == 'self') {
				this.$store.dispatch('basket/ADD_ITEM', item)
				.then(() => {
					this.addBasketToContactDialog = false
					this.openBasketConfirmationDialog('Item added to your basket!')
				})
				return
			}


			if (data.hasOwnProperty('basket')) {
				data.basket.items.push(item);
				const offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`));
				const i = offlineContacts.findIndex((user) => user.id === data.id);
				if (i >= 0) {
					offlineContacts[i] = data;
				}
				localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, JSON.stringify(offlineContacts));
				this.addBasketToContactDialog = false;
				const text = `Item added to ${offlineContacts[i].firstName} ${offlineContacts[i].lastName}'s Basket!`;
				this.openBasketConfirmationDialog(text);
			}
		},
		share (app) {
			if (app === 'facebook' || app === 'instagram') {
				this.noticeDialog = true;
				this.currentSocial = app;
			} else {
				this.shareProduct(app);
			}
		},
		copyText() {
			// const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}\nhttp://appsell.com/product?id=${this.product.id}`;
			const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}`;
			cordova.plugins.clipboard.copy(message);
			this.snackbarMessage = 'Content copied to clipboard';
			this.snackbar = true;
		},
		shareProduct() {
			// this.noticeDialog = false;

			// const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}\nhttp://appsell.com/product?id=${this.product.id}`;
			const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}`;
			const options = {
				message,
				subject: `From AppSel: Product ${this.product.name}`,
				files: [], //c.toDataURL()
				url: `http://appsell.com/product?id=${this.product.id}`,
				// chooserTitle: 'Pick an app'
			};

			this.getDataUri(this.product.downloadURL, (dataUri) => {
				options.files.push(dataUri);

				const onSuccess = (result) => {
					if (result.completed) {
						this.snackbarMessage = `Successfully shared on ${result.app}`;
						this.snackbar = true;
					}
				}

				const onError = (error) => {
					this.snackbarMessage = 'An error occurred';
					this.snackbar = true;
				}

				window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
			});
		},
		canShare(app, cb) {
			const onSuccess = () => {
				cb({success: true});
			}

			const onError = () => {
				cb({success: false});
			}

			window.plugins.socialsharing.canShareVia(app, 'hello', null, null, null, onSuccess, onError);
		},
		getDataUri(url, cb) {
			var image = new Image();

			image.onload = function() {
				var canvas = document.createElement('canvas');
				canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
				canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

				canvas.getContext('2d').drawImage(this, 0, 0);

				// Get raw image data
				// callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

				// ... or get as Data URI
				cb(canvas.toDataURL('image/png'));
			};

			image.src = url;
		},
		addToInventory() {

			// hack to remove quantity validation

			if(!this.$refs.form.validate()) {
				return;
			}

			this.addToInventoryLoading = true;
			this.$store.dispatch('inventory/ADD_TO_INVENTORY', {
				attributes: this.attribute,
				inventory: 0,
				net: 0,
				productId: this.product.id,
				resellerId: null,
				unique: null
			})
			.then((res) => {
				this.addToInventoryLoading = false;

				if (res.exists) {
					this.snackbarMessage = 'Product already exists in inventory';
				} else {
					this.$router.push({name: 'Inventory', params: {
						docRef: res.docRef
					}});
				}
				this.snackbar = true;
			})
		},
		addToStockOrder() {

			if(!this.$refs.form.validate()) {
				return;
			}

			this.addToStockOrderLoading = true;
			this.$store.dispatch('stock_orders/SAVE_ITEM_FROM_INVENTORY', {
				attributes: this.attribute,
				productId: this.product.id
			})
			.then((res) => {
				this.snackbarMessage = res.message;
			})
			.catch((error) => {
				this.snackbarMessage = 'An error occurred';
				console.log(error);
			})
			.finally(() => {
				this.addToStockOrderLoading = false;
				this.snackbar = true;
				this.editItemDialog = false;
			});
		},
		cancelEdit() {
			this.editItemDialog = false
		}
	},
	async mounted() {
		this.product = this.$route.params.product || {};

		if (!this.product.id) {
			this.product = await this.$store.dispatch('products/GET_PRODUCT', this.$route.params.id);
		}

		if (this.product.attributes) {
			this.product.attributes.forEach((attrib) => {
				this.attribute[attrib.name.toLowerCase()] = null;
			});
		}

		this.cordovaBackButton(this.goBack);
	},
	computed: {
		...mapGetters({
			GET_PRODUCTS: 'products/GET_PRODUCTS',
			GET_CURRENT_CATALOGUE: 'GET_CURRENT_CATALOGUE',
			user: 'accounts/user'
		}),
		descriptionTemplate() {
			return this.description;
		}
	},
	filters: {
		trunc(val) {
			const maxLength = 100; // maximum number of characters to extract

			//trim the string to the maximum length
			let trimmedString = val.substr(0, maxLength);

			//re-trim if we are in the middle of a word
			trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));

			return trimmedString;
		}
	},
	components: {
		'mt-spinner': Spinner,
		// 'truncate': truncate,
		'checkmark': CheckMark,
		ContactSelection,
		BottomNav,
		BasketBadge,
		SocialShare,
		Modal
	}
}
</script>

<style scoped>
.img-responsive {
	height: 100%;
	width: 100%;
	max-width: 100%;
}
.product-price {
	font-size: 18px;
	font-weight: 400;
}
.product-name {
	font-size: 23px;
	font-weight: 380;
}
.product-description {
	text-align: justify;
}
.discount-img {
	position: absolute;
	top: 11%;
}

.input-group.input-group--error label {
	animation: none !important;
}

.button-font {
	font-size: 12px !important;
}

.icon-font {
	font-size: 16px;
}
</style>
