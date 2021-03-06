<template>
  <v-bottom-nav
    dark
    app
    fixed
    :value="showNav"
    :active.sync="currentTab"
    color="primary"
  >
    <v-btn flat color="white" value="categories" class="reduced-width">
      <span>Products</span>
      <v-icon>dashboard</v-icon>
    </v-btn>
    <v-btn
      flat
      color="white"
      value="basket"
      v-if="user.type === 'Customer'"
      class="reduced-width"
    >
      <span>Orders</span>
      <v-icon>list</v-icon>
    </v-btn>
    <v-btn
      flat
      color="white"
      value="orders"
      v-else-if="user.type === 'Reseller'"
      class="reduced-width"
    >
      <span>Orders</span>
      <v-badge
        :value="newCustomerOrders"
        color="red"
        right  
        small
      >
        <template v-slot:badge>
          <span class="pa-1" v-if="newCustomerOrders > 0">
            {{ newCustomerOrders }}
          </span>
        </template>
        <v-icon>list</v-icon>
      </v-badge>
    </v-btn>
    <v-btn flat color="white" value="messages" class="reduced-width">
      <span>Messages</span>
      <v-badge
        :value="newMessage"
        color="red"
        right  
        small
      >
        <template v-slot:badge>
          <span class="pa-1" v-if="newMessage > 0">
            {{ newMessage }}
            <!-- <v-icon>question_answer</v-icon> -->
          </span>
        </template>
        <v-icon>message</v-icon>
      </v-badge>
    </v-btn>
    <v-btn
      flat
      color="white"
      value="msa"
      v-if="user.type === 'Reseller'"
      class="reduced-width"
    >
      <span>Organizer</span>
      <v-icon>insert_chart</v-icon>
    </v-btn>
    <!-- <v-btn flat color="white" value="more" class="reduced-width">
      <span>Account</span>
      <v-icon>account_circle</v-icon>
    </v-btn> -->
    <v-btn
      v-if="user.type === 'Reseller'"
      flat
      color="white"
      value="articles"
      class="reduced-width"
    >
      <span>Articles</span>
      <v-badge
        :value="newArticles && articleBadgeNotifState"
        color="red"
        right  
        small
      >
        <template v-slot:badge>
          <span class="pa-1" v-if="newArticles > 0">
            {{ newArticles }}
            <!-- <v-icon>question_answer</v-icon> -->
          </span>
        </template>
        <v-icon>chrome_reader_mode</v-icon>
      </v-badge>
    </v-btn>
  </v-bottom-nav>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: {
    currentTab: {
      required: false
    }
  },
  methods: {
    navigate(val) {
      this.$router.push({ name: "Tabs", params: { tab: val } });
    }
  },
  data: () => ({
    showNav: true,
    width: null,
    ordersBadge: null,
    messageBadge: null,
    visitedArticles: false,
    // newCustomerOrder: 0,
    // newMessage: 0,
  }),
  async created() {
    const user = this.user;

    if (user.type === "Reseller" && user.status === "pending") {
      this.showNav = false;
    } else if (user.type === "Reseller" && user.status === "denied") {
      this.showNav = false;
    } else {
      this.showNav = true;
    }

  },
  mounted() {
    this.width = window.innerWidth;
  },
  methods: {
    toggleNav(val) {
      this.showNav = val;
    }
  },
  computed: {
    ...mapGetters({
      user: "accounts/user",
    }),

    newMessage() {
      const newMessage = this.$store.getters['conversations/GET_CONVERSATION_LIST'];
      return newMessage.filter((convo) => convo.opened[this.user.uid] === false).length;
    },

    newCustomerOrders() {
      const newOrders = this.$store.getters['orders/GET_CUSTOMER_ORDERS'];
      return newOrders.filter((customerOrder) => customerOrder.read === false).length;
    },

    newArticles() {
      let newArticles = this.$store.getters['articles/GET_ARTICLES'];
      
      newArticles = newArticles.map((article) => {
        article.isRead = article.viewedBy.includes(this.user.uid) ? true : false;
        return article;
      });

      return newArticles.filter((article) => article.isRead === false).length;
    },

    articleBadgeNotifState() {
      return this.$store.getters['articles/GET_BADGE_NOTIF_STATE'];
    },

    computedCurrentTab() {
      return this.currentTab;
    }
  },
  watch: {
    currentTab(val) {
      if (val === "msa") {
        this.$router.push({ name: "MySellingAssistant" });
      } else if (val === "messages") {
        this.$router.push({ name: "Messages" });
      } else if (val === "orders") {
        this.$router.push({ name: "Orders" });
      } else if (val === "more") {
        this.$router.push({ name: "More" });
      } else if (val === "categories") {
        this.$router.push({ name: "Catalogue" });
      } else if (val === "basket") {
        this.$router.push({ name: "MyBasket" });
      } else if (val === "articles") {
        if(this.articleBadgeNotifState) {
          this.$store.dispatch('articles/dismissArticleBadgeNotif');
        }
        this.$router.push({ name: "Articles" });
      }
    },

    "user.status"(val) {
      if (this.user.type === "Reseller" && val === "pending") {
        this.showNav = false;
      } else if (this.user.type === "Reseller" && val === "denied") {
        this.showNav = false;
      } else if (this.user.type === "Reseller" && val === "accepted") {
        this.showNav = false;
      } else {
        this.showNav = true;
      }
    }
  }
};
</script>

<style scoped>
/* .nav-text {
  font-size: 12px;
} */

/* .v-btn {
  width: 70px !important;
} */

.reduced-width {
  min-width: 0 !important;
}
</style>
