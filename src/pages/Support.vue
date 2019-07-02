<template>
	<div>

	    <v-toolbar app color="primary" dark>
	      <v-btn icon @click="backToMore">
	        <v-icon>arrow_back</v-icon>
	      </v-btn>
	      <BasketBadge tabName="more" />
	      <v-spacer></v-spacer>
			<Logo />
	    </v-toolbar>

	    <v-container>

	    	<p class="body-2 text-xs-center">
	    		To report any problems or suggest any improvements with this app, use the form below.
	    	</p>

	    	<v-textarea label="Enter your message here..." v-model="message"></v-textarea>

	    	<v-btn @click="submit" block class="primary white--text" :disabled="disableSubmit" :loading="disableSubmit">Submit <v-icon right>send</v-icon></v-btn>

	    </v-container>

	    <Modal ref="modal" />

	    <BottomNav currentTab="more" />
	</div>
</template>

<script>
import {mixins} from '@/mixins';
import BasketBadge from '@/components/BasketBadge';
import BottomNav from '@/components/BottomNav';
import Modal from '@/components/Modal';

export default {
	data: () => ({
		message: null,
		disableSubmit: false
	}),
	mounted() {
		this.cordovaBackButton(this.backToMore);
	},
	methods: {
		backToMore() {
			this.$router.push({ name: 'More' });
		},
		async submit () {
			if (!this.message) {
				return;
			}

			this.disableSubmit = true;

			try {
				await this.$store.dispatch('support/SEND_MESSAGE', this.message);
				this.message = null;
				this.disableSubmit = false;
				this.$refs.modal.show('Success', 'Message sent!', () => {
					this.$router.go(-1);
				});
			} catch (error) {
				this.$refs.modal.show('Error', 'An error occurred', () => {
					this.disableSubmit = false;
				});
				console.log(error);
			}
		}
	},
	mixins: [mixins],
	components: {
		BottomNav,
		BasketBadge,
		Modal
	}
}
</script>
