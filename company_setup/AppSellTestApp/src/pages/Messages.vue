<template>
  <div>
    <v-toolbar app color="primary" dark :extended="extended">
      <v-text-field
        v-model="search"
        label="Search messages..."
        clearable
        v-if="extended"
        slot="extension"
        class="mx-3"
        flat
        solo-inverted
        prepend-icon="search"
      ></v-text-field>
      <BasketBadge />
      <v-btn icon @click="extended = !extended">
        <v-icon v-if="!extended">search</v-icon>
        <v-icon v-else>close</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <ContactsBadge/>
      <Accounts />
    </v-toolbar>

    <v-container id="scroll-target" style="max-height: 85vh;" class="scroll-y" fluid>
      
      <div class="text-xs-center mt-5" v-if="loading">
        <v-progress-circular
          :size="100"
          :width="5"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
      <v-layout
        v-scroll:#scroll-target="onScroll"
        column
        style="height: 85vh;"
        >
      <v-list class="pa-0" v-show="!loading">
        <template
          v-for="i in filterBy(orderBy(items, 'updatedAt', -1), search)"
        >
          <v-list-tile
            two-line
            ripple
            :class="[i.selected ? 'blue lighten-3' : '']"
            avatar
            @click="viewConversation(i)"
            :key="i.id"
          >
            <v-list-tile-avatar v-if="i.user.isAdmin">
              <v-img :src="userPlaceholder" contain></v-img>
            </v-list-tile-avatar>

            <v-list-tile-avatar v-else>
              <v-img :src="i.user.downloadURL" v-if="i.user.hasPicture"></v-img>
              <v-img :src="userPlaceholder" v-else></v-img>
            </v-list-tile-avatar>

            <v-list-tile-content v-if="i.user.isAdmin">
              <v-list-tile-title
                :class="[!i.opened[userId] ? 'blue--text strong-text' : '']"
                >{{ $store.getters["GET_COMPANY"] }} Admin</v-list-tile-title
              >
            </v-list-tile-content>

            <v-list-tile-content v-else>
              <v-list-tile-title
                :class="[!i.opened[userId] ? 'blue--text strong-text' : '']"
                >{{ i.user.firstName }} {{ i.user.middleInitial || "" }}
                {{ i.user.lastName }} {{'sdf'}}</v-list-tile-title
              >
            </v-list-tile-content>

            <v-list-tile-action v-show="!i.opened[userId]">
              <v-icon color="primary">fiber_manual_record</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </v-list>
      </v-layout>
    </v-container>

    <v-btn
      :loading="newMessageBtnLoading"
      :disabled="newMessageBtnLoading"
      fab
      bottom
      right
      fixed
      style="margin-bottom: 55px;"
      @click.stop="openNewMessageDialog"
    >
      <v-icon>message</v-icon>
    </v-btn>

    <BottomNav currentTab="messages" />

    <Modal ref="modal" />

    <NewMessageDialog
      ref="NewMessageDialog"
      @viewConversation="findConversation"
    />
  </div>
</template>


<script>
import BasketBadge from "@/components/BasketBadge";
import { mixins } from "@/mixins";
import Modal from "@/components/Modal";
import { COLLECTION } from "@/config/firebaseInit";
import malePlaceholder from "@/assets/img/male-default.jpg";
import femalePlaceholder from "@/assets/img/female-default.jpg";
import NewMessageDialog from "@/components/NewMessageDialog";
import ContactsBadge from "@/components/ContactsBadge";

export default {
  data: () => ({
    extended: false,
    // items: [],
    conversationsLoaded: false,
    conversationsListener: null,
    messagesListener: null,
    loading: false,
    search: null,
    newMessageBtnLoading: false,
    offsetTop: 0,
  }),
  mounted() {
    // this.$refs.modal.show('Sorry', 'Feature not yet available.', () => {
    // 	this.$router.go(-1);
    // });
  },
  async created() {
    this.loading = true;

    if(this.items.length) {
      this.conversationsLoaded = true;
    }
    // try {
    //   const conversations = await this.$store.dispatch(
    //     "conversations/GET_CONVERSATIONS"
    //   );

    //   this.items = conversations;
    //   this.conversationsLoaded = true;

    //   console.log(this.items);
    // } catch (error) {
    //   console.log(error);
    // }
    this.loading = false;
  },
  methods: {
    // listenToConversations() {
    //   const user = this.$store.getters["accounts/user"];

    //   this.conversationsListener = COLLECTION.conversations
    //     .where("users", "array-contains", user.uid)
    //     .onSnapshot(snapshot => {
    //       if (!this.conversationsLoaded) {
    //         return;
    //       }

    //       snapshot.docChanges().forEach(async change => {
    //         const data = change.doc.data();
    //         data.id = change.doc.id;

    //         if (change.type === "added") {
    //           const userIndex = data.users.findIndex(u => u !== user.uid);
    //           data.user = await this.$store.dispatch(
    //             "accounts/GET_USER",
    //             data.users[userIndex]
    //           );
    //           this.items.push(data);
    //         } else if (change.type === "modified") {
    //           const conversationIndex = this.items.findIndex(
    //             c => c.id === data.id
    //           );
    //           if (conversationIndex !== -1) {
    //             this.items[conversationIndex].updatedAt = data.updatedAt;
    //             this.items[conversationIndex].opened = data.opened;
    //           }
    //         }
    //       });
    //     });
    // },

    findConversation(conversationId) {
      const index = this.items.findIndex(item => item.id === conversationId);
      this.viewConversation(this.items[index]);
    },

    viewConversation(item) {
      this.$router.push({
        name: "ViewMessage",
        params: {
          conversationId: item.id,
          recipientId: item.user.id
        }
      });
    },

    openNewMessageDialog() {
      this.newMessageBtnLoading = true;
      this.$refs.NewMessageDialog.show(() => {
        this.newMessageBtnLoading = false;
      });
    },
    onScroll (e) {
		this.offsetTop = e.target.scrollTop
		},
  },
  beforeDestroy() {
    // this.conversationsListener();
  },
  computed: {
    items() {
      return this.$store.getters['conversations/GET_CONVERSATION_LIST'];
    },
    userPlaceholder(val) {
      return malePlaceholder;
    },
    userId() {
      return this.$store.getters["accounts/user"].uid;
    }
  },
  components: {
    BasketBadge,
    Modal,
    NewMessageDialog,
    ContactsBadge
  },
  mixins: [mixins]
};
</script>
