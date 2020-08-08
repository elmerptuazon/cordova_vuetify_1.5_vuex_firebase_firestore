import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import RegisterSuccess from '@/pages/RegisterSuccess'
import ForgotPassword from '@/pages/ForgotPassword'
import Products from '@/pages/Products'
import Item from '@/pages/Item'
import EditReseller from '@/pages/EditReseller'
import EditProfile from '@/pages/EditProfile'
import Basket from '@/pages/Basket'
import Checkout from '@/pages/Checkout'
import CheckoutSuccess from '@/pages/CheckoutSuccess'
import Order from '@/pages/Order'
import Contacts from '@/pages/Contacts'
import ViewContact from '@/pages/ViewContact'
import AddOfflineContact from '@/pages/AddOfflineContact'
import EditOfflineContact from '@/pages/EditOfflineContact'
import ViewOfflineBasket from '@/pages/ViewOfflineBasket'
import OfflineBasketCheckout from '@/pages/OfflineBasketCheckout'
import PlacedOrder from '@/pages/PlacedOrder'
import MySellingAssistant from '@/pages/MySellingAssistant'
import Payments from '@/pages/Payments'
import Calendar from '@/pages/Calendar'
import Inventory from '@/pages/Inventory'
import SalesPerformance from '@/pages/SalesPerformance';
import SalesPerformanceSummary from '@/pages/msa-sales/SalesPerformanceSummary';
import Customers from '@/pages/msa-sales/Customers';
import MSAProducts from '@/pages/msa-sales/Products';
import Support from '@/pages/Support';
import Messages from '@/pages/Messages';
import Orders from '@/pages/Orders';
import More from '@/pages/More';
import Profile from '@/pages/Profile';
import Catalogue from '@/pages/Catalogue';
import MyBasket from '@/pages/MyBasket';
import Settings from '@/pages/Settings';
import StockOrders from '@/pages/StockOrders';
import NewStockOrder from '@/pages/NewStockOrder';
import InventoryPages from '@/pages/InventoryPages';
import StockOrderCheckout from '@/pages/StockOrderCheckout';
import StockOrderCheckoutSuccess from '@/pages/StockOrderCheckoutSuccess';
import ViewStockOrder from '@/pages/ViewStockOrder';
import ViewMessage from '@/pages/ViewMessage';
import NewDistributor from '@/pages/NewDistributor';
import Articles from '@/pages/Articles';
import ViewArticle from '@/pages/ViewArticle';

import { AUTH } from '@/config/firebaseInit';
import store from '@/store';

Vue.use(Router)

const layout = (layout, requiresAuth) => {
	return {layout, requiresAuth}
}

let router = new Router({
	routes: [
		{
			path: '/',
			name: 'Home',
			component: Home,
			meta: layout('default', false)
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
			meta: layout('authentication', false)
		},
		{
			path: '/register',
			name: 'Register',
			component: Register,
			meta: layout('authentication-light', false)
		},
		{
			path: '/new-distributor',
			name: 'NewDistributor',
			component: NewDistributor,
			meta: layout('authentication', false)
		},
		{
			path: '/register-success',
			name: 'RegisterSuccess',
			component: RegisterSuccess,
			meta: layout('register-success', true)
		},
		{
			path: '/articles',
			name: 'Articles',
			component: Articles,
			meta: layout('articles', true)
		},
		{
			path: '/view-article',
			name: 'ViewArticle',
			component: ViewArticle,
			meta: layout('articles', true)
		},
		{
			path: '/catalogue',
			name: 'Catalogue',
			component: Catalogue,
			meta: layout('catalogue', true)
		},
		{
			path: '/forgot-password',
			name: 'ForgotPassword',
			component: ForgotPassword,
			meta: layout('authentication', false)
		},
		{
			path: '/products',
			name: 'Products',
			component: Products,
			meta: layout('products', true)
		},
		{
			path: '/product/:id',
			name: 'Item',
			component: Item,
			meta: layout('products', true)
		},
		{
			path: '/orders',
			name: 'Orders',
			component: Orders,
			meta: layout('orders', true)
		},
		{
			path: '/my-basket',
			name: 'MyBasket',
			component: MyBasket,
			meta: layout('orders', true)
		},
		{
			path: '/order/basket',
			name: 'Basket',
			component: Basket,
			meta: layout('orders', true)
		},
		{
			path: '/order/:orderNo',
			name: 'Order',
			component: Order,
			meta: layout('orders', true)
		},
		{
			path: '/order/checkout',
			name: 'Checkout',
			component: Checkout,
			meta: layout('orders', true)
		},
		{
			path: '/order/checkout-success',
			name: 'CheckoutSuccess',
			component: CheckoutSuccess,
			meta: layout('orders', true)
		},
		{
			path: '/my-profile',
			name: 'Profile',
			component: Profile,
			meta: layout('profile', true)
		},
		{
			path: '/edit-profile',
			name: 'EditProfile',
			component: EditProfile,
			meta: layout('products', true)
		},
		{
			path: '/edit-reseller',
			name: 'EditReseller',
			component: EditReseller,
			meta: layout('profile', true)
		},
		{
			path: '/contacts',
			name: 'Contacts',
			component: Contacts,
			meta: layout('contacts', true)
		},
		{
			path: '/contacts/:id',
			name: 'ViewContact',
			component: ViewContact,
			meta: layout('contacts', true)
		},
		{
			path: '/add-offline-contact',
			name: 'AddOfflineContact',
			component: AddOfflineContact,
			meta: layout('contacts', true)
		},
		{
			path: '/edit-offline-contact',
			name: 'EditOfflineContact',
			component: EditOfflineContact,
			meta: layout('contacts', true)
		},
		{
			path: '/view-offline-basket',
			name: 'ViewOfflineBasket',
			component: ViewOfflineBasket,
			meta: layout('orders', true)
		},
		{
			path: '/offline-basket/checkout',
			name: 'OfflineBasketCheckout',
			component: OfflineBasketCheckout,
			meta: layout('orders', true)
		},
		{
			path: '/placed-order',
			name: 'PlacedOrder',
			component: PlacedOrder,
			meta: layout('orders', true)
		},
		{
			path: '/my-selling-assistant',
			name: 'MySellingAssistant',
			component: MySellingAssistant,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/payments',
			name: 'Payments',
			component: Payments,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/calendar',
			name: 'Calendar',
			component: Calendar,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/inventory',
			name: 'Inventory',
			component: Inventory,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/sales-performance',
			name: 'SalesPerformance',
			component: SalesPerformance,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/sales-performance/sales-performance-summary',
			name: 'SalesPerformanceSummary',
			component: SalesPerformanceSummary,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/sales-performance/customers',
			name: 'Customers',
			component: Customers,
			meta: layout('msa', true)
		},
		{
			path: '/my-selling-assistant/sales-performance/products',
			name: 'MSAProducts',
			component: MSAProducts,
			meta: layout('msa', true)
		},
		{
			path: '/more',
			name: 'More',
			component: More,
			meta: layout('more', true)
		},
		{
			path: '/more/support',
			name: 'Support',
			component: Support,
			meta: layout('more', true)
		},
		{
			path: '/more/settings',
			name: 'Settings',
			component: Settings,
			meta: layout('more', true)
		},
		{
			path: '/messages',
			name: 'Messages',
			component: Messages,
			meta: layout('messages', true)
		},
		{
			path: '/messages/:conversationId',
			name: 'ViewMessage',
			component: ViewMessage,
			meta: layout('messages', true)
		},
		{
			path: '/stock-orders',
			name: 'StockOrders',
			component: StockOrders,
			meta: layout('stock-orders', true)
		},
		{
			path: '/new-stock-order',
			name: 'NewStockOrder',
			component: NewStockOrder,
			meta: layout('stock-orders', true)
		},
		{
			path: '/new-stock-order/checkout',
			name: 'StockOrderCheckout',
			component: StockOrderCheckout,
			meta: layout('stock-orders', true)
		},
		{
			path: '/new-stock-order/checkout/success',
			name: 'StockOrderCheckoutSuccess',
			component: StockOrderCheckoutSuccess,
			meta: layout('stock-orders', true)
		},
		{
			path: '/stock-order/:id',
			name: 'ViewStockOrder',
			component: ViewStockOrder,
			meta: layout('stock-orders', true)
		},
		{
			path: '/msa/inventory-pages',
			name: 'InventoryPages',
			component: InventoryPages,
			meta: layout('msa', true)
		}
	]
})

router.beforeEach((to, from, next) => {
	const user = store.getters['accounts/user'];
	if(to.matched.some(record => record.meta.requiresAuth)) {
		if(!AUTH.currentUser) {
			next({
				path: '/',
				query: {
					redirecT: to.fullPath
				}
			})
		} else {
			next()
		}
	} else if(to.matched.some(record => !record.meta.requiresAuth)) {
		if(AUTH.currentUser) {
			if (user.type === 'Reseller' && user.status === 'pending') {
				next({
					path: '/more',
					query: {
						redirecT: to.fullPath
					}
				});
			} else if (user.type === 'Reseller' && user.status === 'denied') {
				next({
					path: '/more',
					query: {
						redirecT: to.fullPath
					}
				});
			} else {
				next({
					path: '/catalogue',
					query: {
						redirecT: to.fullPath
					}
				});
			}
		} else {
			next()
		}
	} else {
		next()
	}
})

export default router
