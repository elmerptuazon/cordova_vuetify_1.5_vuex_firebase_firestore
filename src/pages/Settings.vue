<template>
	<div>

		<v-toolbar app color="primary" dark v-if="$store.state.rightAlignToolbarIcons">
			<v-btn icon @click="backToMain">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<Logo />
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Settings</v-toolbar-title>
			<v-spacer></v-spacer>
		</v-toolbar>

		<v-toolbar app color="primary" dark v-else>
			<v-btn icon @click="backToMain">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Settings</v-toolbar-title>
			<v-spacer></v-spacer>
			<Logo />
		</v-toolbar>

		<div>
			<v-layout row>
				<v-flex xs12>
					<v-list class="transparent">
						<v-subheader>NOTIFICATIONS</v-subheader>
						<v-list-tile>
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">New Messages</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-switch v-model="settings.newMessages" color="green darken-1" hide-details></v-switch>
							</v-list-tile-action>
						</v-list-tile>
						<v-list-tile>
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">Catalogue Updates</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-switch v-model="settings.catalogueUpdates" color="green darken-1" hide-details></v-switch>
							</v-list-tile-action>
						</v-list-tile>
						<v-list-tile v-if="user.type === 'Reseller'">
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">New Orders</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-switch v-model="settings.newOrders" color="green darken-1" hide-details></v-switch>
							</v-list-tile-action>
						</v-list-tile>
						<v-list-tile>
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">Delivery Schedules</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-switch v-model="settings.deliverySchedules" color="green darken-1" hide-details></v-switch>
							</v-list-tile-action>
						</v-list-tile>
						<v-list-tile>
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">New Promotions</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-switch disabled v-model="settings.newPromotions" color="green darken-1" hide-details></v-switch>
							</v-list-tile-action>
						</v-list-tile>
						<v-divider></v-divider>
						<v-subheader>MEDIA</v-subheader>
						<v-list-tile>
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">Save to Camera Roll</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-switch disabled v-model="settings.saveToCameraRoll" color="green darken-1" hide-details></v-switch>
							</v-list-tile-action>
						</v-list-tile>
						<v-divider  v-if="user.type === 'Reseller'"></v-divider>
						<v-subheader  v-if="user.type === 'Reseller'">CONTACTS</v-subheader>
						<v-list-tile  v-if="user.type === 'Reseller'">
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-2">Sort By</v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action>
								<v-btn-toggle v-model="settings.contactsSortBy">
									<v-btn flat small value="first" style="font-size: 10px;">
										<div class="pa-2">First Name</div>
									</v-btn>
									<v-btn flat small value="last" style="font-size: 10px;">
										<div class="pa-2">Last Name</div>
									</v-btn>
								</v-btn-toggle>
							</v-list-tile-action>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile>
							<v-list-tile-content>
								<v-list-tile-title class="grey--text text--darken-1"></v-list-tile-title>
							</v-list-tile-content>
							<v-list-tile-action class="grey--text text--darken-1">
								{{ $store.getters['GET_VERSION'] }}
							</v-list-tile-action>
						</v-list-tile>
					</v-list>
				</v-flex>
			</v-layout>
		</div>

		<BottomNav currentTab="more" />
	</div>
</template>



<script>
import { mapGetters } from 'vuex';
import moment from 'moment'
import ProfileHeader from '@/components/ProfileHeader'
import {mixins} from '@/mixins';

export default {
	mixins: [mixins],
	computed: {
		...mapGetters('accounts', [
			'user',
			'settings'
			])
	},
	methods: {
		backToMain() {
			this.$router.go(-1);
		}
	},
	watch: {
		settings: {
			handler (val) {
				console.log(val)
				this.$store.dispatch('accounts/UPDATE_USER_SETTINGS', val)
			},
			deep: true
		}
	}
}

</script>

<style scoped>
.header-text {
  font-size: 11px;
}

.subheader {
  font-size: 11px;
}
</style>

