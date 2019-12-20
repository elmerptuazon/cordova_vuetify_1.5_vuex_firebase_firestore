<template>
	<v-dialog v-model="dialog" persistent>
		<v-card>
			<v-card-title primary-title>
				<div class="title">{{title}}</div>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text>

				{{message}}

			</v-card-text>
			<v-card-actions>
				<v-btn block color="primary" :disabled="disableButton" :loading="disableButton" @click="action">{{confirmText}}</v-btn>
				<v-btn block color="grey darken-2" dark @click="close">Cancel</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: {
		confirmText: {
			type: String,
			required: false,
			default: 'Yes'
		}
	},
	data: () => ({
		dialog: false,
		title: null,
		message: null,
		proceedAction: null,
		disableButton: false
	}),
	mounted () {
		console.log('Confirmation Modal connected.');
	},
	methods: {
		show (title, message) {
			this.title = title;
			this.message = message;
			this.dialog = true;
		},
		close () {
			this.dialog = false;
		},
		action () {
			this.disableButton = true;
			this.$emit('confirmClicked',this.disableButton = false);
			
		}
	}
}
</script>
