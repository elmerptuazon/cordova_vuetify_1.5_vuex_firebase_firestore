<template>
	<div>
		<v-toolbar app color="primary" dark>
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">{{action}} Your Reseller</v-toolbar-title>
		</v-toolbar>
		<v-container fluid>
			<div id="customer-container" class="mt-2">
				<v-form v-model="resellerValid" ref="resellerForm" lazy-validation>
					<v-text-field :clearable="resellerFound" :rules="basicRules" required label="Email address or Mobile number" v-model="resellerSearch"></v-text-field>
					<p class="grey--text text--darken-2 mt-4 subheading text-xs-center">
						{{`${resellerDetails.firstName || 'Your'} ${resellerDetails.middleInitial || ''} ${resellerDetails.lastName || 'Reseller'}`}}
					</p>
					<div class="text-xs-center">
						<v-avatar :tile="true" size="92px" class="grey lighten-4">
							<img v-lazy="imgObj" alt="reseller_img" class="elevation-1 flipped">
						</v-avatar>
					</div>
					<div class="mt-5 px-5">
						<v-btn depressed @click="findReseller" color="primary" :loading="btnLoading" :disabled="btnLoading" block large v-show="!resellerFound">Find Your Reseller</v-btn>
						<v-btn depressed color="primary" block large v-show="resellerFound" @click="confirmReseller" :loading="btnLoading" :disabled="btnLoading">Confirm Reseller</v-btn>
						<div class="mt-4 text-xs-center">
							<v-btn flat type="button" color="primary" @click="goBack">Cancel</v-btn>
						</div>
					</div>
				</v-form>
			</div>
		</v-container>
		<Dialog />
		<Modal ref="modal" />
	</div>
</template>



<script>
import {mixins} from '@/mixins';
import {mapGetters} from 'vuex';
import Modal from '@/components/Modal';

export default {
	data: () => ({
		action: null,
		resellerValid: true,
		imgObj: {
			src: null,
			loading: require('../../static/img/spinner.gif'),
			error: require('../../static/img/default-profpic.png')
		},
		resellerSearch: null,
		resellerFound: false,
		resellerDetails: {},
		btnLoading: false
	}),
	components: {Modal},
	methods: {
		findReseller () {
			if (this.$refs.resellerForm.validate()) {
				this.Indicator().open()
				this.$store.dispatch('accounts/FIND_RESELLER', {data: this.resellerSearch})
				.then((res) => {
					console.log(res)
					if (!res.empty) {
						this.Indicator().close()
						this.resellerFound = true
						this.resellerDetails = Object.assign({}, res.data)
						this.imgObj.src = this.resellerDetails.downloadURL
					} else {
						this.Indicator().close()
						this.resellerFound = false
						this.$events.$emit('SET_DIALOG', {
							status: true,
							title: 'Sorry',
							message: 'No reseller found.'
						})
					}
				})
				.catch((e) => {
					this.Indicator().close()
					this.$events.$emit('SET_DIALOG', {
						status: true,
						title: 'Find Reseller Error',
						message: 'An error occurred.'
					})
					console.error(e)
				})
			}
		},
		confirmReseller () {

			const payload = {
				customers: this.resellerDetails.customers,
				customerId: this.user.uid,
				resellerId: this.resellerDetails.uid,
				resellerData: this.resellerDetails
			}

			this.Indicator().open();

			this.$store.dispatch('accounts/ADD_CUSTOMER_TO_RESELLER', payload)
			.then(() => {
				this.Indicator().close();
				this.$refs.modal.show('Success', 'Your reseller has been updated.', () => {
					this.$router.go(-1);
				});
			})
			.catch((e) => {
				this.Indicator().close();
				this.$refs.modal.show('Confirm reseller error', 'Unexpected error occurred.', () => {
					this.$router.go(-1);
				});
			});

		},
		goBack () {
			this.$router.go(-1);
		}
	},
	computed: {
		...mapGetters({
			userReseller: 'accounts/userReseller',
			user: 'accounts/user'
		})
	},
	created () {
		this.action = this.$route.params.action === 'add' ? 'Add' : 'Update'
		const userReseller = this.user.resellerData
		if (userReseller !== undefined) {
			this.resellerDetails = userReseller
			this.imgObj.src = userReseller.downloadURL
			console.log(this.resellerDetails)
		}
	},
	watch: {
		resellerSearch () {
			if (!this.resellerSearch) {
				this.resellerDetails = Object.assign({}, this.$store.getters['accounts/userReseller'])
				this.resellerFound = false
				this.imgObj.src = this.resellerDetails.downloadURL
			}
		}
	},
	mixins: [mixins]
}
</script>

<style scoped>
.flipped {
	-webkit-transform: scaleX(-1);
	transform: scaleX(-1);
}
</style>
