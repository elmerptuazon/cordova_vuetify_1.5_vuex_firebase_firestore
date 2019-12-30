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
        :value="ordersBadge"
        color="red"
        right  
        small
      >
        <template v-slot:badge>
          <span></span>
        </template>
        <v-icon>list</v-icon>
      </v-badge>
    </v-btn>
    <v-btn flat color="white" value="messages" class="reduced-width">
      <span>Messages</span>
      <v-icon>message</v-icon>
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
      value="contacts"
      class="reduced-width"
    >
      <span>Customers</span>
      <v-icon>people</v-icon>
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
  }),
  created() {
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
      user: "accounts/user"
    }),
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
      } else if (val === "contacts") {
        this.$router.push({ name: "Contacts" });
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
