<template>
	<div style="width: 130px;">
		<v-img :src="companyLogo" contain></v-img>
	</div>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
	computed: {
		...mapGetters({
			companyLogo: 'GET_LOGO'
		})
	}
}
</script>

<style scoped>
</style>
