<template>
	<div>

		<v-toolbar app color="primary" dark :extended="extended">
			<v-text-field v-model="search" label="Search order..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="search"></v-text-field>
			<v-btn icon @click="goToBasket" v-if="user.type === 'Customer'">
				<v-badge right color="red" overlap v-model="showBadge">
					<span slot="badge">{{GET_ITEMS_LENGTH}}</span>
					<v-icon>shopping_basket</v-icon>
				</v-badge>
			</v-btn>
			<BasketBadge v-else-if="user.type === 'Reseller'" />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Accounts />
		</v-toolbar>

		<v-container class="px-0 pt-3">
			<div class="spinner-position" v-show="loader">
				<mt-spinner type="snake" color="#1976D2" :size="40"></mt-spinner>
			</div>
		<div class="text-xs-center">
			<v-btn style="font-size: 11px; min-width: 80px; width: 82px;" class="ma-1" :outline="m.outline" depressed color="primary" v-for="m in menu" :key="m.name" round small @click="select(m.name)">{{m.name}}</v-btn>
		</div>
		<table class="basket-table" style="width: 100%;" >
			<tbody>
				<tr>
					<td class="caption text-xs-right" style="width: 50%;"></td>
					<td class="caption text-xs-right" @click="sortOrdersBy = 'created_at'" :class="[sortOrdersBy === 'created_at' ? 'top-underline' : '']">DATE</td>
					<td class="caption text-xs-right" @click="sortOrdersBy = 'totalPrice'" :class="[sortOrdersBy === 'totalPrice' ? 'top-underline' : '']">TOTAL COST</td>
				</tr>
			</tbody>
		</table>
		<div v-if="selected === 'Basket'">
			<v-list two-line dense>
				<template v-for="(contact, i) in orderBy(filterBy(offlineOrders, search), sortOrdersBy, -1)">
					<v-divider></v-divider>
					<v-list-tile :key="i" @click="viewOfflineOrder(contact)">
						<v-list-tile-avatar>
							<v-avatar size="42px" tile>
								<img
								v-lazy="contact.imageObj"
								:style="getSmallSize(contact.imageDimensions)"
								class="thin-border"
								/>
							</v-avatar>
						</v-list-tile-avatar>
						<v-list-tile-content style="width: 100px;">
							<v-list-tile-title class="text-xs-left body-1">Order</v-list-tile-title>
							<v-list-tile-sub-title class="text-xs-left caption wordwrap">
								{{contact.firstName}} {{contact.middleName || ''}} {{contact.lastName || ''}}
							</v-list-tile-sub-title>
						</v-list-tile-content>
						<v-list-tile-content>
							<v-list-tile-title class="text-xs-left body-1">{{ Date.now() | momentify('DD-MMM-YYYY') }}</v-list-tile-title>
							<v-list-tile-sub-title class="text-xs-left body-1 caption">Total value</v-list-tile-sub-title>
						</v-list-tile-content>
						<v-list-tile-content>
							<v-list-tile-title class="text-xs-right body-1">BASKET</v-list-tile-title>
							<v-list-tile-sub-title class="text-xs-right body-1 caption orange--text text--darken-2" v-if="contact.basket.orderStatus === 'Basket'">{{contact.basket.totalPrice | currency('P')}}</v-list-tile-sub-title>
						</v-list-tile-content>
					</v-list-tile>
				</template>
			</v-list>
		</div>
		<div v-else>
			<v-list two-line dense v-if="allOrders.length > 0">
				<template v-for="(order, i) in orderBy(filterBy(allOrders, search), sortOrdersBy, -1)">
					<v-divider></v-divider>
					<v-list-tile :key="i" @click="$router.push({name: 'PlacedOrder', params: {order, selected}})"
					:class="[order.hasOwnProperty('read') && !order.read ? 'grey lighten-2' : '']"
					>
					<v-list-tile-avatar v-if="order.accountData">
						<v-avatar size="42px" tile>
							<v-img :src="order.accountData.downloadURL" v-if="!order.offlineContact && order.accountData.downloadURL" class="thin-border" contain></v-img>

							<v-img
							:src="maleDefaultImage"
							v-else-if="!order.offlineContact && !order.accountData.downloadURL && order.accountData.gender == 'Male'"
							class="thin-border" contain></v-img>

							<v-img
							:src="femaleDefaultImage"
							v-else-if="!order.offlineContact && !order.accountData.downloadURL && order.accountData.gender == 'Female'"
							class="thin-border" contain></v-img>

							<v-img :src="order.offlineContact.displayPicture" v-else-if="order.offlineContact && order.offlineContact.displayPicture" class="thin-border" contain></v-img>

							<v-img
							:src="maleDefaultImage"
							v-else-if="order.offlineContact && order.offlineContact.gender == 'Male'"
							class="thin-border" contain></v-img>

							<v-img
							:src="femaleDefaultImage"
							v-else-if="order.offlineContact && order.offlineContact.gender == 'Female'"
							class="thin-border" contain></v-img>
						</v-avatar>
					</v-list-tile-avatar>
					<v-list-tile-content style="width: 100px;">
						<v-list-tile-title class="text-xs-left body-1">Order {{order.id}}</v-list-tile-title>
						<v-list-tile-sub-title class="text-xs-left caption wordwrap" v-if="!order.offlineContact">
							{{order.accountData.firstName}} {{order.accountData.middleInitial || ''}} {{order.accountData.lastName || ''}}
						</v-list-tile-sub-title>
						<v-list-tile-sub-title class="text-xs-left caption wordwrap" v-else>
							{{order.offlineContact.firstName}} {{order.offlineContact.middleInitial || ''}} {{order.offlineContact.lastName || ''}}
						</v-list-tile-sub-title>
					</v-list-tile-content>
					<v-list-tile-content>
						<v-list-tile-title class="text-xs-left body-1">{{ order.created_at | momentify('DD-MMM-YYYY') }}</v-list-tile-title>
					</v-list-tile-content>
					<v-list-tile-content>
						<v-list-tile-title class="text-xs-right body-1">{{order.status | status}}</v-list-tile-title>
						<v-list-tile-sub-title :class="[order.hasOwnProperty('read') && !order.read ? '' : 'orange--text text--darken-2']" class="text-xs-right body-1 caption">{{order.total | currency('P')}}</v-list-tile-sub-title>
					</v-list-tile-content>
				</v-list-tile>
			</template>
		</v-list>
		<div class="text-xs-center" v-else>
			<p class="headline grey--text">Empty</p>
		</div>
	</div>
</v-container>
<v-snackbar
:timeout="2200"
bottom
v-model="snackbar"
>
{{snackbarMsg}}
</v-snackbar>

<BottomNav currentTab="orders" />
</div>
</template>


<script>
import { date } from '@/mixins/date';
import { mixins } from '@/mixins';
import { mapGetters } from 'vuex'
import { Spinner } from 'mint-ui';
import BasketBadge from '@/components/BasketBadge';
import MaleDefaultImage from '@/assets/img/male-default.jpg';
import FemaleDefaultImage from '@/assets/img/female-default.jpg';
import { AUTH } from '@/config/firebaseInit';
export default {
	data: () => ({
		extended: false,
		search: null,
		sortOrdersBy: 'created_at',
		loader: false,
		orderItems: [],
		menu: [
		{
			name: 'Basket',
			color: 'primary',
			outline: true
		},
		{
			name: 'Placed',
			color: 'white',
			outline: false
		},
		{
			name: 'In Progress',
			color: 'primary',
			outline: true
		},
		{
			name: 'Delivered',
			color: 'primary',
			outline: true
		}
		],
		selected: '',
		disabledChips: false,
		snackbar: false,
		snackbarMsg: null,
		offlineOrders: [],
		maleDefaultImage: null,
		femaleDefaultImage: null
	}),
	created () {
		this.GET_OFFLINE_ORDERS();

		if (this.$route.params.from_menu) {
			this.select(this.$route.params.from_menu);
			return;
		}

		this.select('Placed');

	},
	mounted () {
		this.maleDefaultImage = MaleDefaultImage;
		this.femaleDefaultImage = FemaleDefaultImage;
	},
	beforeDestroy() {
		delete this.$route.params.from;
	},
	methods: {
		viewAllOrders() {
			this.$events.$emit('SET_CURRENT_TAB', 'basket')
		},
		viewOrder(orderNo) {
			this.Indicator().open()
			this.$store.dispatch('orders/GET_ORDER', orderNo)
			.then((response) => {
				this.Indicator().close()
				this.$router.push({
					name: 'Order',
					params: {
						orderData: response,
						orderNo
					}
				})
			})
		},
		select(name) {

			if (this.disabledChips && this.selected != 'Basket') {
				this.snackbarMsg = 'Please wait for orders to be loaded'
				this.snackbar = true
				return;
			}

			this.menu = this.menu.map((m) => {
				m.color = name === m.name ? 'white' : 'primary'
				m.outline = name === m.name ? false : true
				return m
			})

			this.selected = name
		},
		viewOfflineOrder (contact) {
			this.$router.push({name: 'ViewOfflineBasket', params: {basket: contact}, query: { fromOrders: true }})
		},
		getOrders (status) {
			return this.$store.dispatch('orders/GET_ORDERS_BY_STATUS', {status})
		},
		goToBasket () {
			this.$router.push({
				name: 'Basket',
				params: {
					previousRoute: this.$router.history.current.name,
					previousTab: 'orders'
				}
			})
		},
		getSmallSize ({width, height}) {
			const size = this.calculateAspectRatioFit(+width, +height, 42, 42);
			size.width = size.width + 'px';
			size.height = size.height + 'px';
			return size;
		},
		getImageDimension (src) {
			return new Promise((resolve) => {
				var i = new Image();
				i.onload = function() {
					resolve({
						width: this.width,
						height: this.height
					});
				}
				i.src = src;
			})
		},
		GET_OFFLINE_ORDERS () {
		  // GET ALL OFFLINE CONTACTS
		  let offlineContacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`))
		  // GET OFFLINE CONTACTS WITH BASKET
		  offlineContacts = offlineContacts.map((contact) => {
		  	const totalPrice = contact.basket.items.reduce((a, b) => {
		  		const total = b.attribute.qty * b.product.price
		  		return +a + +total
		  	}, 0)
		  	contact.basket.totalPrice = totalPrice
		  	contact.basket.orderStatus = 'Basket'
		  	return contact
		  });

		  offlineContacts = offlineContacts.filter((contact) => contact.basket.items.length > 0);

		  const promises = [];

		  offlineContacts.forEach((contact) => {
		  	if (!document.URL.includes('http')) {
		  		contact.imageObj.src = contact.imageObj.src.replace('/static/', '');
		  	}
		  	promises.push(
		  		this.getImageDimension(contact.imageObj.src)
		  		.then((dimensions) => {
		  			contact.imageDimensions = dimensions;
		  			return contact;
		  		})
		  		);
		  });

		  Promise.all(promises)
		  .then((response) => {
		  	this.offlineOrders = response;
		  });
		}

	},
	computed: {
		...mapGetters({
			GET_SUBTOTAL: 'basket/GET_SUBTOTAL',
			GET_ORDERS: 'orders/GET_ORDERS',
			GET_ITEMS_LENGTH: 'basket/GET_ITEMS_LENGTH',
			user: 'accounts/user'
		}),
		showBadge() {
			return this.GET_ITEMS_LENGTH > 0 ? true : false
		},
		allOrders () {
			return this.orderItems
		}
	},
	filters: {
		status(val) {
			return val.toUpperCase()
		}
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge
	},
	mixins: [date, mixins],
	watch: {
		selected (val) {
			this.orderItems.length = 0
			this.disabledChips = true
			if (val === 'Placed') {
				this.loader = true
				this.getOrders('placed')
				.then((response) => {
					console.log(response)
					this.loader = false
					this.orderItems = response
					this.disabledChips = false
				})
				.catch((e) => {
					console.error(e)
					this.loader = false
					this.disabledChips = false
				})
			} else if (val === 'In Progress') {
				this.loader = true
				this.getOrders('in progress')
				.then((response) => {
					this.loader = false
					this.orderItems = response
					this.disabledChips = false
				})
				.catch((e) => {
					console.error(e)
					this.loader = false
					this.disabledChips = false
				})
			} else if (val === 'Delivered') {
				this.loader = true
				this.getOrders('delivered')
				.then((response) => {
					console.log(response)
					this.loader = false
					this.orderItems = response
					this.disabledChips = false
				})
				.catch((e) => {
					console.error('error', e)
					this.loader = false
					this.disabledChips = false
				})
			}
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

.basket-table td {
	padding: 8px;
}

.top-underline {
	text-decoration: overline;
	color: #1976D2;
}

.spinner-position {
	position: absolute;
	left: 50%;
	top: 50%;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}

.wordwrap {
	white-space:normal;
	/*white-space: pre-wrap !important;*/
}

.profpic-container {
	width: 40px;
	height: 40px;
	overflow: hidden;
}

.thin-border {
	/*border: 1px solid #021a40;*/
}

.v-chip {width: 80px;}
div.v-chip__content {

	text-align: center;
}

div.btn__content {
	padding: 0;
}

div.card__actions .btn {
	min-width: 0;
}
</style>
