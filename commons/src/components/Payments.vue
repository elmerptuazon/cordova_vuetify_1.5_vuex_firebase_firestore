<template>
	<v-data-table
	:headers="headers"
	:items="items"
	hide-actions
	class="elevation-0"
	>
	<template slot="items" slot-scope="props">
		<td>{{ props.item.date }}</td>
		<td>{{ props.item.value | currency('P') }}</td>
		<td v-if="hasAction" class="text-xs-right">
			<v-btn flat icon @click="edit(props.item)" small><v-icon small color="primary">border_color</v-icon></v-btn>
		</td>
	</template>
	<template slot="footer" v-if="user.type === 'Reseller'">
		<td colspan="100%" class="text-xs-right">
			<v-btn small flat icon @click.native="$emit('ADD')"><v-icon color="primary">add</v-icon></v-btn>
		</td>
	</template>
</v-data-table>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
	props: {
		items: {
			type: Array,
			default: []
		},
		hasAction: {
			type: Boolean,
			default: true
		}
	},
	data: () => ({
		headers: [
		{ text: 'Date', value: 'date' },
		{ text: 'Price', value: 'value' }
		]
	}),
	created () {
		if (this.user.type === 'Reseller') {
			this.headers.push({ text: 'Action', sortable: false });
		}
	},
	methods: {
		edit (item) {
			this.$emit('EDIT_PAYMENT', item)
		}
	},
	computed: {
		...mapGetters({
			user: 'accounts/user'
		})
	}
}
</script>

<style scoped>
#items {
	border-collapse: collapse;
	width: 100%;
}

#items td, #items th {
	border: 1px solid #ddd;
	padding: 8px;
}
</style>