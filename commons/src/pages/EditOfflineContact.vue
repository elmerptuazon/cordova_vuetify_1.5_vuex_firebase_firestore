<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="backToContactView">
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-toolbar-title v-if="$store.state.showToolbarTitles">Edit Offline Contact</v-toolbar-title>
    </v-toolbar>

    <v-container fluid grid-list-lg>
      <v-form v-model="valid" ref="form" lazy-validation>
        <div class="text-xs-center mb-4">
          <div class="camera-image-container">
            <img
              src="./../../static/img/camera-icon.png"
              alt="camera-icon"
              class="inner-image"
              @click="sheet = true"
            />
          </div>
          <v-avatar :tile="true" size="90px" class="grey lighten-4">
            <img :src="userData.displayPicture" class="mt-2 elevation-1 flipped" alt="avatar" />
          </v-avatar>
        </div>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              required
              label="First Name"
              v-model="userData.firstName"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field label="Middle Name" v-model="userData.middleInitial"></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              required
              label="Last Name"
              v-model="userData.lastName"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              label="Birthday"
              append-icon="date_range"
              readonly
              @click="openCalendar"
              v-model="userData.birthday"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-radio-group :rules="basicRules" required v-model="userData.gender" row>
              <v-radio label="Male" value="Male" color="primary"></v-radio>
              <v-radio label="Female" value="Female" color="pink"></v-radio>
            </v-radio-group>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              append-icon="mail"
              label="Email address"
              v-model="userData.email"
              type="email"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              type="number"
              append-icon="contact_phone"
              label="Mobile number"
              v-model="userData.contact"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-btn
              block
              color="white"
              depressed
              class="blue--text text--darken-2"
              @click="updateUser"
            >Save Changes</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-container>
    <v-snackbar bottom v-model="snackbar">{{ snackbarMessage }}</v-snackbar>
    <Dialog />
    <v-bottom-sheet full-width v-model="sheet">
      <v-list>
        <v-subheader v-if="!userData.hasPicture">Add using</v-subheader>
        <v-subheader v-else>Update using</v-subheader>
        <v-list-tile @click="takePicture('camera')">
          <v-list-tile-avatar>
            <v-icon>camera_alt</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title>Camera</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="takePicture('photo_library')">
          <v-list-tile-avatar>
            <v-icon>photo_library</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title>Gallery</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>
    <Modal ref="modal" />
  </div>
</template>

<script>
import { mixins } from "@/mixins";
import { mapGetters } from "vuex";
const loader = require("./../../static/img/spinner.gif");
const malePlaceholder = require("./../../static/img/male-default.jpg");
const femalePlaceholder = require("./../../static/img/female-default.jpg");
import { AUTH, COLLECTION } from "@/config/firebaseInit";
import Modal from "@/components/Modal";

export default {
  components: {
    Modal,
  },
  data: () => ({
    userData: {},
    snackbar: false,
    snackbarMessage: null,
    valid: true,
    sheet: false,
  }),
  created() {
    this.userData = Object.assign({}, this.$route.params.data);
    const src =
      this.userData.gender === "Male" ? malePlaceholder : femalePlaceholder;
    this.userData.imageObj = {
      src,
      loading: loader,
    };
    // add profile picture if hasPicture prop is true
    if (this.userData.hasPicture) {
      this.userData.imageObj.src = this.userData.displayPicture;
    } else {
      this.userData.displayPicture = src;
    }

    this.cordovaBackButton(this.backToContactView);
  },
  methods: {
    backToContactView() {
      this.$router.push({
        name: "ViewContact",
        params: { user: this.userData, id: this.userData.id },
      });
    },

    updateUser() {
      if (this.$refs.form.validate()) {
        this.Indicator().open();
        this.userData.updatedAt = Date.now();

        this.userData.firstName = this.capitalizeFirstLetter(
          this.userData.firstName
        );
        this.userData.lastName = this.capitalizeFirstLetter(
          this.userData.lastName
        );
        this.userData.middleInitial = this.capitalizeFirstLetter(
          this.userData.middleInitial
        );
        this.userData.email = this.userData.email.toLowerCase();

        const errors = {};
        const offlineContacts = JSON.parse(
          localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
        );

        if (this.userData.contact) {
          const i = offlineContacts.findIndex(
            (user) => user.contact === this.userData.contact
          );

          if (i >= 0 && offlineContacts[i].id !== this.userData.id) {
            errors.contact = true;
          }
        }

        if (this.userData.email) {
          const i = offlineContacts.findIndex(
            (user) => user.email === this.userData.email
          );

          if (i >= 0 && offlineContacts[i].id !== this.userData.id) {
            errors.email = true;
          }
        }

        if (errors.contact && errors.email) {
          this.Indicator().close();
          this.$refs.modal.show(
            "Error",
            "Contact and Email address is being used by another contact"
          );
          return;
        }

        if (errors.email) {
          this.Indicator().close();
          this.$refs.modal.show(
            "Error",
            "Email address is being used by another contact"
          );
          return;
        }

        if (errors.contact) {
          this.Indicator().close();
          this.$refs.modal.show(
            "Error",
            "Contact number is being used by another contact"
          );
          return;
        }

        this.updateOfflineContact(this.userData).then((res) => {
          this.Indicator().close();
          this.$refs.modal.show("Success", "Offline contact updated", () => {
            this.$router.push({
              name: "ViewContact",
              params: {
                user: this.userData,
                id: this.userData.id,
                viewOfflineContacts: true,
              },
            });
          });
        });
      }
    },

    takePicture(selected) {
      this.$store
        .dispatch("plugins/TAKE_PHOTO", selected)
        .then((res) => {
          this.sheet = false;
          if (res) {
            this.userData.displayPicture = res;
            this.userData.hasPicture = true;
            this.userData.imageObj.src = res;
            //this.updateUser()
          } else {
            this.userData.hasPicture = false;
          }
        })
        .catch((error) => {
          this.sheet = false;
          alert(error);
        });
    },

    openCalendar() {
      const options = {
        date: new Date(),
        mode: "date",
        android: {
          theme: 3,
        },
        success: (newDate) => {
          this.userData.birthday = this.$moment(newDate).format("MM/DD/YYYY");
        },
      };

      cordova.plugins.DateTimePicker.show(options);
    },

    updateOfflineContact(data) {
      return new Promise((resolve) => {
        const offlineContacts = JSON.parse(
          localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
        );
        const i = offlineContacts.findIndex((user) => user.id === data.id);

        if (i !== -1) {
          offlineContacts[i] = data;
        }

        localStorage.setItem(
          `${AUTH.currentUser.uid}_offline_contacts`,
          JSON.stringify(offlineContacts)
        );

        this.$store
          .dispatch("contacts/SYNC_OFFLINE_CUSTOMERS")
          .then(() => resolve(offlineContacts));

        COLLECTION.orders
          .where("offlineContact.id", "==", data.id)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              var orderRef = COLLECTION.orders.doc(doc.id);
              var offlineContacts = {
                offlineContact: {},
              };
              delete data.basket;
              offlineContacts.offlineContact = data;
              orderRef.update(offlineContacts);
            });
          });
      });
    },

    capitalizeFirstLetter(string) {
      if (!string) return string;
      return string.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
  },
  mixins: [mixins],
};
</script>

<style>
.input-group.input-group--error label {
  animation: none !important;
}

.flipped {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}

.camera-image-container {
  position: absolute;
  top: 110px;
  left: 50%;
  z-index: 1;
}

.inner-image {
  position: relative;
  left: -50%;
  width: 70%;
}

.icon {
  display: inline-flex !important;
}
</style>
