<template>
	<div>

		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Customers</v-toolbar-title>
			<v-text-field v-model="search" label="Search customer..." clearable v-if="extended" slot="extension" class="mx-3" flat solo-inverted
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
				<v-avatar size="35px" tile v-if="props.item.isOffline && props.item.displayPicture">
					<v-img contain :src="props.item.displayPicture"></v-img>
				</v-avatar>
				<v-avatar size="35px" tile v-else-if="props.item.isOffline && !props.item.displayPicture">
					<v-img contain v-if="props.item.gender === 'Male'" :src="malePlacecholder"></v-img>
					<v-img contain v-else :src="femalePlaceholder"></v-img>
				</v-avatar>
				<v-avatar size="35px" tile v-else-if="!props.item.isOffline && props.item.downloadURL">
					<v-img contain :src="props.item.downloadURL"></v-img>
				</v-avatar>
				<v-avatar size="35px" tile v-else-if="!props.item.isOffline && !props.item.downloadURL">
					<v-img contain v-if="props.item.gender === 'Male'" :src="malePlacecholder"></v-img>
					<v-img contain v-else :src="femalePlaceholder"></v-img>
				</v-avatar>
			</div>
			<div style="margin-left: 50px;">
				{{ props.item.fullName }}
			</div>
			
		</td>
		<td class="text-xs-right">{{ props.item.totalSpent | currency('P') }}</td>
		<td class="text-xs-right">{{ props.item.totalItems }}</td>
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
import MaleDefaultImage from '@/assets/img/male-default.jpg';
import FemaleDefaultImage from '@/assets/img/female-default.jpg';

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
		{ text: 'Top 10 Customers', value: 'fullName', align: 'center', class: 'pa-0' },
		{ text: 'by PHP value', value: 'totalSpent', align: 'center', class: 'pa-0' },
		{ text: 'by # of items', value: 'totalItems', align: 'center', class: 'pa-0' }
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
		this.fetchCustomers(this.selected);
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
		fetchCustomers (selected) {
			let contacts;
			this.loading = true;
			this.$store.dispatch('contacts/GET_CUSTOMERS', {selected})
			.then((data) => {
				contacts = data;
				return this.$store.dispatch('contacts/GET_OFFLINE_CUSTOMERS', {selected: this.selected})
			})
			.then((data) => {
				console.log(data)
				this.items = contacts.concat(data).map((item) => {
					item.fullName = `${item.firstName} ${item.middleInitial || ''} ${item.lastName}`;

					if (item.downloadURL) {
						item.imageObj.src = item.downloadURL;
					}

					return item;
				});
				this.loading = false;
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
		}),

		malePlacecholder () {
			return MaleDefaultImage;
		},

		femalePlaceholder () {
			return FemaleDefaultImage;
		}
	},
	components: {
		'mt-spinner': Spinner,
		BasketBadge,
		BottomNav
	},
	watch: {
		selected (val) {
			this.fetchCustomers(val);
		},
		items (val) {
			this.pagination.rowsPerPage = val.length;
		}
	}
}

</script>

<style scoped>
.thin-border {
	border: 1px solid #021a40;
}
</style>
