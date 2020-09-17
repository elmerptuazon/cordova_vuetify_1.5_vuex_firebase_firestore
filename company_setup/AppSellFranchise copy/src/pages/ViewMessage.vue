<template>
	<div>

		<v-toolbar app color="primary" dark :extended="extended">
			<v-btn icon @click="goBack">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-text-field
				v-model="search"
				label="Search messages..."
				v-if="extended"
				slot="extension"
				class="mx-3"
				flat solo-inverted clearable
				prepend-icon="search"
			></v-text-field>
			<v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
			<BasketBadge />
			<v-btn icon @click="extended = !extended">
				<v-icon v-if="!extended">search</v-icon>
				<v-icon v-else>close</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<ContactsBadge/>
			<Accounts />
		</v-toolbar>

		<div class="text-xs-center mt-5" v-if="loading">
			<v-progress-circular :size="100" :width="5" color="primary" indeterminate></v-progress-circular>
		</div>

		<div id="messages-container" v-show="!loading" class="scroll-y smoothScroll pa-2" :style="{ height: `${height}px` }">
			<div
				v-for="m in filterBy(orderBy(messages, 'created'), search)"
				:key="m.id"
				class="message-container"
			>
				<div
					v-if="m.attachment"
					style="width: 200px;"
					:class="[m.you ? 'you my-2' : 'not-you my-2']"
				>
					<v-img :src="m.url" contain max-width="200"></v-img>
				</div>
				<v-card
					flat class="message"
					:class="[m.you ? 'you primary white--text' : 'not-you grey lighten-2 grey--text text--darken-3']"
					v-else
				>
					<v-card-text class="pa-2">
						<div>{{ m.text }}</div>
					</v-card-text>
				</v-card>
			</div>
		</div>

		<v-layout wrap>
			<v-flex xs12>
				<div class="px-2" v-show="!loading">
					<v-textarea
						prepend-icon="insert_photo"
						@click:prepend="openAttachment"
						@focus="toggleNav(false)"
						@blur="toggleNav(true)"
						v-model="text"
						placeholder="Type a message..."
						outline single-line auto-grow
						rows="1" row-height="1" full-width rounded
						append-outer-icon="send"
						@click:append-outer="sendMessage"
						:loading="sendLoader"
						id="text-message"
					></v-textarea>
				</div>
			</v-flex>
		</v-layout>

		<v-bottom-sheet full-width v-model="sheet">
			<v-list>
				<v-subheader>Add using</v-subheader>
				<v-list-tile @click="attachment('camera')">
					<v-list-tile-avatar>
						<v-icon>camera_alt</v-icon>
					</v-list-tile-avatar>
					<v-list-tile-title>Camera</v-list-tile-title>
				</v-list-tile>
				<v-list-tile @click="attachment('photo_library')">
					<v-list-tile-avatar>
						<v-icon>photo_library</v-icon>
					</v-list-tile-avatar>
					<v-list-tile-title>Gallery</v-list-tile-title>
				</v-list-tile>
			</v-list>
		</v-bottom-sheet>
		<BottomNav currentTab="messages" ref="BottomNav" />
		<Loader ref="loader" />

	</div>
</template>


<script>
	import BasketBadge from '@/components/BasketBadge';
	import Loader from '@/components/Loader';
	import { mixins } from '@/mixins';
	import { COLLECTION, DB, AUTH, STORAGE } from '@/config/firebaseInit';
	import { downScaleImage } from '@/helpers/helpers';
	import malePlaceholder from '@/assets/img/male-default.jpg';
	import femalePlaceholder from '@/assets/img/female-default.jpg';
	import uuidv4 from 'uuid/v4';
	import ContactsBadge from "@/components/ContactsBadge";

	export default {
		data: () => ({
			extended: false,
			items: [],
			loading: false,
			// messages: [],
			text: null,
			height: null,
			search: null,
			conversationsListener: null,
			messagesListener: null,
			sendLoader: false,
			keyboardHeight: null,
			innerHeight: null,
			sheet: false,
			conversationId: '',
			offsetTop: 0,
		}),
		async created () {
			this.loading = true;
			const { conversationId } = this.$route.params;
			this.conversationId = conversationId;

			try {
				// this.listenToConversations(conversationId);
				await this.$store.dispatch('conversations/LISTEN_TO_MESSAGES', conversationId);
				await this.$store.dispatch('conversations/OPEN_UNREAD', conversationId);
				// await this.listenToNewMessages(conversationId);
			} catch (error) {
				console.log(error);
				this.loading = false;
			}

      		this.scrollDown();
		},

		mounted () {
			this.innerHeight = window.innerHeight;
			this.height = window.innerHeight - 175;
			this.finalHeight = this.height;

			window.addEventListener('resize', (event) => {
				this.calculateScreenSize(event);
			});

			this.loading = false;
			this.scrollDown();
		},

		watch: {
			height(val) {
				this.scrollDown();
			}
		},

		methods: {
			goBack () {
				this.$router.push({ name: 'Messages' });
      		},

			calculateScreenSize(event) {
				console.log('resize triggered: ', event);
				if (!this.keyboardHeight) {
					this.keyboardHeight = this.innerHeight - event.target.innerHeight;
					console.log('kb height', this.keyboardHeight)
				}

				if(cordova.platformId == 'android') {
					if (this.innerHeight > event.target.innerHeight) {
						this.height = this.finalHeight - (this.keyboardHeight - 55);
						console.log(this.height)
					} else {
						this.height = this.innerHeight - 175;
						console.log(this.height)
					}

				} else {
					console.log('is keyboard open: ', Keyboard.isVisible);
					if(!Keyboard.isVisible) {
						this.height = this.finalHeight - (this.keyboardHeight - 55);

          			} else {
            			this.height = this.innerHeight - 175;
          			}
				}

        		this.scrollDown();
      		},

			async sendMessage () {
				if (!this.text) {
					return;
				}

				this.sendLoader = true;

				const text = this.text;
				this.text = null;

				try {
					const { conversationId, recipientId } = this.$route.params;
					const response = await this.$store.dispatch('conversations/SEND_MESSAGE', {
						conversationId: conversationId,
						text: text,
						recipientId: recipientId
					});

				} catch (error) {
					console.log(error);
				}

				this.sendLoader = false;
				this.scrollDown();
			},

			toggleNav (val) {
				if(!val) {
				// focus

				//mark convo as read when the user focused on the message text area
				//especially when the user stays on this page
					if(!this.currentConversation.opened[this.userId]) {
						this.$store.dispatch('conversations/OPEN_UNREAD', this.conversationId);
					}
				}

				this.$refs.BottomNav.toggleNav(val);
				this.scrollDown();
			},

			openAttachment () {
				this.sheet = true;
			},

			async attachment (selected) {
				try {

					this.sheet = false;

					const res = await this.$store.dispatch('plugins/UPLOAD_ATTACHMENT', {
						sourceType: selected
					});

					this.$refs.loader.loader = true;

					const data = await downScaleImage(res, 200);

					const snapshot = await STORAGE.ref('appsell').child('attachments/' + uuidv4()).putString(data, 'data_url');
					const downloadURL = await snapshot.ref.getDownloadURL();

					const { conversationId, recipientId } = this.$route.params;
					const response = await this.$store.dispatch('conversations/SEND_MESSAGE', {
						attachment: true,
						url: downloadURL,
						conversationId: conversationId,
						recipientId: recipientId
					});

					this.scrollDown();
				} catch (error){
					this.$refs.modal.show('Sorry', 'An error occurred');
					console.log(error);
				}

				this.$refs.loader.loader = false;
			},

			scrollDown () {
				setTimeout(() => {
					const messagesWindow = document.getElementById('messages-container');
					const totalHeight = messagesWindow.scrollHeight;
					messagesWindow.scrollTo(0, totalHeight);
				}, 1500)
			},
			onScroll (e) {
				this.offsetTop = e.target.scrollTop
			},
		},
		beforeDestroy () {
			// this.conversationsListener();
			// this.messagesListener();
		},
		computed: {
			messages() {
				const items = this.$store.getters['conversations/GET_MESSAGES_LIST'];
				this.scrollDown();
				return items;
			},
			currentConversation() {
				const convo = this.$store.getters['conversations/GET_CONVERSATION_LIST'];
				const index = convo.findIndex((convo) => convo.id === this.conversationId);
				console.log('current convo', convo[index]);
				return convo[index];
			},
			userPlaceholder (val) {
				return malePlaceholder;
			},
			userId () {
				return this.$store.getters['accounts/user'].uid;
			},
			calculatedHeight () {
				return this.height;
			}
		},
		components: {
			BasketBadge,
			Loader,
			ContactsBadge
		},
		mixins: [mixins]
	}

</script>

<style scoped>
  .smoothScroll {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

	#messages-container {
		overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
	}

	.v-text-field--outline>.v-input__control>.v-input__slot {
		border-radius: 35px;
	}

	#text-container {
		overflow: hidden;
		position: fixed;
		width: 100%;
		height: 57px;
	}

	.you {
		float: right;
	}

	.message-container:before,
	.message-container:after {
		content: " ";
		display: table;
	}
	.message-container:after {
		clear: both;
	}

	.not-you {
		float: left;
	}

	.message {
		position: relative;
		max-width: 250px;
		width: auto;
		display: inline-block;
		word-wrap: break-word;
		white-space: pre-wrap;
		margin-bottom: 10px;
	}

	.strong-text {
		font-weight: 900;
	}

	.v-input__icon--append>.v-icon {
		font-size: 35px;
	}
</style>
