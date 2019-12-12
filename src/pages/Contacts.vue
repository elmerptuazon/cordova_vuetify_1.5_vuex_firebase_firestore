<template>
  <div>
    <v-toolbar app color="primary" dark :extended="extended">
      <v-btn icon @click="backToMore">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-text-field
        label="Search contact..."
        clearable
        v-model="search"
        v-if="extended"
        slot="extension"
        class="mx-3"
        flat
        solo-inverted
        prepend-icon="search"
      ></v-text-field>
      <v-btn icon @click="extended = !extended">
        <v-icon v-if="!extended">search</v-icon>
        <v-icon v-else>close</v-icon>
      </v-btn>
      <v-btn
        v-show="contactType === 'Offline'"
        icon
        @click="$router.push({ name: 'AddOfflineContact' })"
      >
        <v-icon>person_add</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <Logo />
    </v-toolbar>

    <v-container fluid grid-list-lg class="pa-0 pt-3">
      <div class="text-xs-center">
        <div class="title mt-2">Customers</div>

        <v-btn-toggle class="mt-1" v-model="contactType">
          <v-btn flat value="Online">
            Online
          </v-btn>
          <v-btn flat value="Offline">
            Offline
          </v-btn>
        </v-btn-toggle>
      </div>
      <div class="mt-3" v-if="contactType === 'Online'">
        <div class="text-xs-center" v-show="onlineContactLoader">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <v-layout
          row
          v-if="!GET_ONLINE_LIST.length"
          align-center
          justify-center
          mt-3
        >
          <v-flex xs5>
            <span class="title grey--text lighten-2">No Customers</span>
          </v-flex>
        </v-layout>

        <v-list v-else two-line class="transparent">
          <template
            v-for="(c, i) in filterBy(
              GET_ONLINE_LIST,
              search,
              'firstName',
              'lastName',
              'header'
            )"
          >
            <v-subheader
              class="title grey lighten-2 grey--text text--darken-3"
              v-if="c.header"
              :key="i"
              >{{ c.header }}</v-subheader
            >
            <v-divider inset v-else-if="c.divider" :key="i"></v-divider>
            <v-list-tile avatar v-else :key="c.id" @click="viewContact(c)">
              <v-list-tile-avatar>
                <v-avatar size="50px" tile>
                  <v-img
                    :src="c.imageObj"
                    :alt="c.firstName"
                    class="flipped"
                    contain
                  ></v-img>
                </v-avatar>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-if="settings.contactsSortBy === 'first'"
                  >{{ c.firstName }} {{ c.lastName || "" }}</v-list-tile-title
                >
                <v-list-tile-title v-else
                  >{{ c.lastName || "" }}, {{ c.firstName }}</v-list-tile-title
                >
                <v-list-tile-sub-title>{{
                  c.contact || ""
                }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </div>
      <div class="mt-2" v-else-if="contactType === 'Offline'">
        <v-layout
          row
          v-if="!offlineContacts.length"
          align-center
          justify-center
          mt-3
        >
          <v-flex xs5>
            <span class="title grey--text lighten-2">No Customers</span>
          </v-flex>
        </v-layout>

        <v-list v-else two-line class="transparent">
          <template
            v-for="c in filterBy(
              offlineContacts,
              search,
              'firstName',
              'lastName',
              'header'
            )"
          >
            <v-subheader
              class="title grey lighten-2 grey--text text--darken-3"
              v-if="c.header"
              :key="c.i"
              >{{ c.header }}</v-subheader
            >
            <v-list-tile avatar v-else :key="c.id" @click="viewContact(c)">
              <v-list-tile-avatar>
                <v-avatar size="50px" tile>
                  <v-img
                    :src="c.imageObj"
                    :alt="c.firstName"
                    class="flipped"
                    contain
                  ></v-img>
                </v-avatar>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-if="settings.contactsSortBy === 'first'"
                  >{{ c.firstName }} {{ c.lastName || "" }}</v-list-tile-title
                >
                <v-list-tile-title v-else
                  >{{ c.lastName || "" }}, {{ c.firstName }}</v-list-tile-title
                >
                <v-list-tile-sub-title>{{
                  c.contact || ""
                }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </div>
    </v-container>
  </div>
</template>

<script>
import { mixins } from "@/mixins";
import { mapGetters } from "vuex";
import { Spinner } from "mint-ui";
const malePlaceholder = require("./../../static/img/male-default.jpg");
const femalePlaceholder = require("./../../static/img/female-default.jpg");
const loader = require("./../../static/img/spinner.gif");
import { AUTH } from "@/config/firebaseInit";
export default {
  data: () => ({
    extended: false,
    search: "",
    contactType: "Online",
    spinner: false,
    onlineContactLoader: false,
    offlineContacts: []
  }),
  created() {
    this.spinner = true;
    if (this.$route.params.viewOfflineContacts) {
      this.contactType = "Offline";
    }

    //this.contactType = 'Offline'

    // GET ONLINE CONTACTS
    this.onlineContactLoader = true;
    this.$store.dispatch("contacts/GET_ONLINE_CONTACTS").then(() => {
      this.onlineContactLoader = false;
      this.spinner = false;
    });

    this.cordovaBackButton(this.backToMore);
  },
  beforeDestroy() {
    this.$store.commit("contacts/CLEAR_LIST");
  },
  methods: {
    backToMore() {
      this.$router.go(-1);
      //this.$router.push({name: 'MySellingAssistant'});
    },
    viewContact(contact) {
      this.$router.push({
        name: "ViewContact",
        params: { id: contact.id, user: contact }
      });
    },
    getSmallSize({ width, height }) {
      const size = this.calculateAspectRatioFit(+width, +height, 42, 42);
      size.width = size.width + "px";
      size.height = size.height + "px";
      return size;
    },
    getImageDimension(src) {
      return new Promise(resolve => {
        var i = new Image();
        i.onload = function() {
          resolve({
            width: this.width,
            height: this.height
          });
        };
        i.src = src;
      });
    },
    GET_OFFLINE_LIST() {
      let contacts = JSON.parse(
        localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
      );
      contacts = contacts.map(c => {
        const src = c.gender === "Male" ? malePlaceholder : femalePlaceholder;
        c.imageObj = {
          src,
          loading: loader
        };
        if (c.hasPicture) {
          c.imageObj.src = c.displayPicture;
        }
        return c;
      });
      // SORT
      if (this.settings.contactsSortBy == "first") {
        contacts = contacts.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
      } else if (this.settings.contactsSortBy == "last") {
        contacts = contacts.sort((a, b) =>
          a.lastName.localeCompare(b.lastName)
        );
      }
      var currentHeader;
      // ADD HEADINGS
      contacts = contacts.reduce((a, user) => {
        if (this.settings.contactsSortBy == "first") {
          if (currentHeader !== user.firstName[0]) {
            currentHeader = user.firstName[0];
            a.push({ header: currentHeader });
          }
        } else if (this.settings.contactsSortBy == "last") {
          if (currentHeader !== user.lastName[0]) {
            currentHeader = user.lastName[0];
            a.push({ header: currentHeader });
          }
        }
        a.push(user);
        return a;
      }, []);

      const promises = [];

      contacts.forEach(contact => {
        if (!contact.header) {
          promises.push(
            this.getImageDimension(contact.imageObj.src).then(dimensions => {
              contact.imageDimensions = dimensions;
              return contact;
            })
          );
        } else {
          promises.push(contact);
        }
      });

      Promise.all(promises).then(response => {
        this.offlineContacts = response;
      });
    }
  },
  computed: {
    ...mapGetters({
      GET_ONLINE_LIST: "contacts/GET_ONLINE_LIST_WITH_ALPHABETS",
      settings: "accounts/settings"
    })
  },
  watch: {
    contactType(newVal, oldVal) {
      if (!newVal) this.contactType = oldVal;
      if (this.contactType === "Offline") {
        this.GET_OFFLINE_LIST();
      }
    }
  },
  components: {
    "mt-spinner": Spinner
  },
  mixins: [mixins]
};
</script>


<style scoped>
.input-group.input-group--error label {
  animation: none !important;
}

.flipped {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}

.spinner-position {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
