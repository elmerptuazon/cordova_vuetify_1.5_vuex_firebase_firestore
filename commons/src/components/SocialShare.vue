<template>
	<v-container grid-list-md text-xs-center>
		<v-layout row wrap>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="facebook" alt="facebook" @click="share('facebook')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">Facebook</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="messenger" alt="messenger" @click="share('messenger')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">Messenger</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="twitter" alt="twitter" @click="share('twitter')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">Twitter</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="whatsapp" alt="whatsapp" @click="share('whatsapp')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">WhatsApp</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="instagram" alt="instagram" @click="share('instagram')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">Instagram</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="viber" alt="viber" @click="share('viber')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">Viber</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="sms" alt="sms" @click="share('sms')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">SMS</div>
			</v-flex>
			<v-flex xs3>
				<v-avatar tile>
					<img v-lazy="email" alt="email" @click="share('email')">
				</v-avatar>
				<br />
				<div class="grey--text text--darken-2">Email</div>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import facebook from '@/assets/social/facebook.png';
import messenger from '@/assets/social/messenger.png';
import twitter from '@/assets/social/twitter.png';
import whatsapp from '@/assets/social/whatsapp.png';
import instagram from '@/assets/social/instagram.png';
import viber from '@/assets/social/viber.png';
import sms from '@/assets/social/sms.png';
import email from '@/assets/social/email.png';
import loading from '@/assets/img/spinner.gif';
export default {
	computed: {
		facebook() {
			return {
				src: facebook,
				loading
			}
		},
		messenger() {
			return {
				src: messenger,
				loading
			}
		},
		twitter() {
			return {
				src: twitter,
				loading
			}
		},
		whatsapp() {
			return {
				src: whatsapp,
				loading
			}
		},
		instagram() {
			return {
				src: instagram,
				loading
			}
		},
		viber() {
			return {
				src: viber,
				loading
			}
		},
		sms() {
			return {
				src: sms,
				loading
			}
		},
		email() {
			return {
				src: email,
				loading
			}
		}
	},
	methods: {
		share (app) {
			this.$emit('share', app);
		}
	}
}
</script>