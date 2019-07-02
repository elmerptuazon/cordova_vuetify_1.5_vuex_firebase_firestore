<template>
	<div>
		<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
			<v-card>
				<v-toolbar dark color="primary">
					<v-btn icon dark @click="dialog = false">
						<v-icon>arrow_back</v-icon>
					</v-btn>
					<v-toolbar-title>New Message</v-toolbar-title>
				</v-toolbar>
				<v-card-text>
					<v-form>
						<v-layout row wrap>
							<v-flex xs12>
								<v-autocomplete return-object v-model="selectedUser" :items="items" label="Type the name of a person" item-text="fullName"></v-autocomplete>
							</v-flex>
							<v-flex xs12>
								<v-textarea v-model="text" placeholder="Type a message..." box></v-textarea>
							</v-flex>
						</v-layout>
					</v-form>

					<div class="mt-2"></div>

					<v-btn :loading="loading" :dsiabled="loading" class="primary white--text" block @click="send">Send Message</v-btn>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>


export default {
	data: () => ({
		dialog: false,
		selectedUser: {},
		items: [],
		text: null,
		loading: false
	}),
	methods: {
		async show (cb) {
			try {
				if (this.user.type === 'Reseller') {
					const data = await this.$store.dispatch('accounts/GET_CUSTOMERS');
					console.log(data)
					this.items = data.map((d) => {
						d.fullName = `${d.firstName} ${d.middleInitial || ''} ${d.lastName}`;
						return d;
					});
				} else {
					if (!this.user.resellerData) {
						return;
					}

					const reseller = JSON.parse(JSON.stringify(this.user.resellerData));
					reseller.fullName = `${reseller.firstName} ${reseller.middleInitial || ''} ${reseller.lastName}`;
					reseller.id = reseller.uid;
					this.items = [reseller];
					this.selectedUser = reseller;
					console.log(reseller)
				}
			} catch (error) {
				console.log(error);
			}

			this.dialog = true;

			if (cb) {
				cb();
			}
		},
		async send () {
			if (!this.text || !this.selectedUser.id) {
				return;
			}

			this.loading = true;

			try {
				const id = this.selectedUser.id;
				const data = await this.$store.dispatch('conversations/CHECK_IF_EXISTS', id);

				if (data.length > 0) {
					const conversation = data[0];

					const messageData = {
						conversationId: conversation.id,
						text: this.text,
						recipientId: id
					};

					await this.$store.dispatch('conversations/SEND_MESSAGE', messageData);
					this.$emit('viewConversation', conversation.id);
				} else {
					try {
						const res = await this.$store.dispatch('conversations/ADD_CONVERSATION', {
							recipientId: id,
							sendMessage: true
						});

						const messageData = {
							conversationId: res.id,
							text: this.text,
							recipientId: id
						};

						await this.$store.dispatch('conversations/SEND_MESSAGE', messageData);
						this.$emit('viewConversation', res.id);
					} catch (error) {
						console.log(error);
					}
				}

				this.text = null;
				this.selectedUser = {};
				this.dialog = false;
			} catch (error) {
				console.log(error);
			}

			this.loading = false;
		}
	},
	computed: {
		user () {
			return this.$store.getters['accounts/user'];
		}
	}
}
</script>
