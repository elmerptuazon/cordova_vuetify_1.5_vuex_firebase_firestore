<template>
	<div>
		<v-toolbar app color="primary" dark :extended="extended">
			<v-btn icon @click="closeDialog">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-text-field label="Search contact..." clearable v-model="search" v-if="extended" slot="extension" class="mx-3" flat solo-inverted
			prepend-icon="search"></v-text-field>
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<!--<v-btn icon @click="$router.push({name: 'AddOfflineContact'})">
				<v-icon>person_add</v-icon>
			</v-btn>-->
			<v-spacer></v-spacer>
		</v-toolbar>
		<v-container fluid grid-list-lg class="pa-0 pt-4">
			
			<div class="mt-5">
				<div class="text-xs-center">
					<div class="title">Select Customer</div>
				</div>
				<v-list two-line class="transparent">
					<!-- <v-list-tile @click="addToBasket('self')">
						<v-list-tile-content>
							<v-list-tile-title class="text-xs-center">ADD TO MY BASKET</v-list-tile-title>
						</v-list-tile-content>
					</v-list-tile> -->
					<template v-for="(c, i) in filterBy(GET_OFFLINE_LIST, search, 'firstName', 'lastName', 'header')"> 
						<v-subheader class="title grey lighten-2 grey--text text--darken-3" v-if="c.header" :key="c.header">{{ c.header }}</v-subheader>
						<v-list-tile avatar v-else :key="c.id" @click="addToBasket(c)">
							<v-list-tile-avatar>
								<v-avatar>
									<img v-lazy="c.imageObj" :alt="c.firstName" class="flipped">
								</v-avatar>
							</v-list-tile-avatar>
							<v-list-tile-content>
								<v-list-tile-title>{{ c.firstName }} {{ c.lastName || '' }}</v-list-tile-title>
								<v-list-tile-sub-title>{{ c.contact || '' }}</v-list-tile-sub-title>
							</v-list-tile-content>
						</v-list-tile>
					</template>
				</v-list>
			</div>
		</v-container>
	</div>
</template>

<script>
import { mixins } from '@/mixins';
import { mapGetters } from 'vuex';
const malePlaceholder = require('./../../static/img/male-default.jpg');
const femalePlaceholder = require('./../../static/img/female-default.jpg');
const loader = require('./../../static/img/spinner.gif');
import {AUTH} from '@/config/firebaseInit';

export default {
	data: () => ({
		extended: false,
		search: '',
		contactType: 'Online'
	}),
	created() {
		if (!localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)) {
			localStorage.setItem(`${AUTH.currentUser.uid}_offline_contacts`, '[]');
		}
	},
	methods: {
		closeDialog () {
			this.$emit('CLOSEDIALOG')
		},
		addToBasket (c) {

			if (typeof c == 'string') {
				const message = 'Add to your cart?'
				this.$emit('SELECTEDCONTACT', c)
			} else {
				const message = `Add item to ${c.firstName} ${c.lastName}'s Shopping Cart?`
				this.$emit('SELECTEDCONTACT', c)
			}

			return;

			const self = this
			document.addEventListener('deviceready', onDeviceReady, false);
			function onDeviceReady() {
				if (typeof c == 'string') {
					const message = 'Add to your cart?'
					navigator.notification.confirm(message, function (buttonIndex) {
						if (buttonIndex === 1) {
							self.$emit('SELECTEDCONTACT', c)
						}
					});
				} else {
					const message = `Add item to ${c.firstName} ${c.lastName}'s Shopping Cart?`
					navigator.notification.confirm(message, function (buttonIndex) {
						if (buttonIndex === 1) {
							self.$emit('SELECTEDCONTACT', c)
						}
					})
				}
			}
		}
	},
	computed: {
		GET_OFFLINE_LIST () {
			let contacts = JSON.parse(localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`))
			contacts = contacts.map((c) => {
				const src = c.gender === 'Male' ? malePlaceholder : femalePlaceholder
				c.imageObj = {
					src,
					loading: loader
				}
				if (c.hasPicture) {
					c.imageObj.src = c.displayPicture
				}
				return c
			})
			// SORT
			contacts = contacts.sort((a, b) => a.firstName.localeCompare(b.firstName))
			var currentHeader 
			// ADD HEADINGS
			contacts = contacts.reduce((a, user) => {
				if (currentHeader !==  user.firstName[0]) {
					currentHeader = user.firstName[0]
					a.push({header: currentHeader})
				}
				a.push(user)
				return a
			},[])
			return contacts
		}
	},
	watch: {
		contactType (newVal, oldVal) {
			if (!newVal) this.contactType = oldVal
		}
},
mixins: [mixins]
}

</script>


<style scoped>
.input-group.input-group--error label {
  animation: none !important;
}

.flipped {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
