<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="$router.go(-1)">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">Add Offline Contact</v-toolbar-title>
    </v-toolbar>
    <v-container fluid grid-list-md class="pa-4">
      <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
        <v-layout row wrap>
          <!-- <v-flex xs12>
						<v-select :rules="basicRules" prepend-icon="person_outline" required :items="['Customer']" label="I am a..." v-model="registerData.type" single-line
						bottom></v-select>
          </v-flex>-->
          <v-flex xs12>
            <v-text-field
              id="first-name"
              :rules="basicRules"
              required
              label="First Name"
              v-model="registerData.firstName"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field label="Middle Name" v-model="registerData.middleInitial"></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              required
              label="Last Name"
              v-model="registerData.lastName"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              label="Birthday"
              append-icon="date_range"
              readonly
              @click="openCalendar"
              v-model="registerData.birthday"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-radio-group :rules="basicRules" required v-model="registerData.gender" row>
              <v-radio label="Male" value="Male" color="primary"></v-radio>
              <v-radio label="Female" value="Female" color="pink"></v-radio>
            </v-radio-group>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              type="number"
              append-icon="contact_phone"
              label="Mobile number"
              v-model="registerData.contact"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              append-icon="email"
              label="Email address"
              v-model="registerData.email"
              type="email"
            ></v-text-field>
          </v-flex>
        </v-layout>
        <div class="px-4">
          <div class="text-xs-center" v-if="registerData.displayPicture">
            <v-img :src="registerData.displayPicture" alt="display_picture"></v-img>
          </div>
          <v-bottom-sheet full-width v-model="sheet">
            <v-btn depressed block large slot="activator" type="button">
              <div v-if="!registerData.displayPicture">Add Profile Picture</div>
              <div v-else>Change Profile Picture</div>
            </v-btn>
            <v-list>
              <v-subheader>Add using</v-subheader>
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
          <v-btn
            flat
            v-show="registerData.displayPicture"
            despressed
            block
            @click="registerData.displayPicture = null"
          >Remove Profile Picture</v-btn>
          <v-btn depressed color="primary" block large type="submit">Submit</v-btn>
        </div>
      </v-form>
      <Dialog />
    </v-container>
    <v-snackbar bottom v-model="snackbar">{{ snackbarMessage }}</v-snackbar>
    <Modal ref="modal" />
  </div>
</template>

<script>
import { mixins } from "@/mixins";
import { AUTH } from "@/config/firebaseInit";
import Modal from "@/components/Modal";

export default {
  components: {
    Modal,
  },
  data: () => ({
    snackbar: false,
    snackbarMessage: null,
    sheet: false,
    valid: true,
    registerData: {
      type: "Customer",
      firstName: null,
      middleInitial: null,
      lastName: null,
      birthday: null,
      gender: null,
      contact: null,
      displayPicture: null,
      email: null,
    },
    birthdayMenu: false,
    pickerValue: null,
  }),
  methods: {
    submit() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.Indicator().open();
      this.registerData.createdAt = Date.now();

      this.registerData.firstName = this.capitalizeFirstLetter(
        this.registerData.firstName
      );
      this.registerData.lastName = this.capitalizeFirstLetter(
        this.registerData.lastName
      );
      this.registerData.middleInitial = this.capitalizeFirstLetter(
        this.registerData.middleInitial
      );

      const errors = {};
      const offlineContacts = JSON.parse(
        localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
      );

      if (this.registerData.contact) {
        const i = offlineContacts.findIndex(
          (user) => user.contact === this.registerData.contact
        );

        if (i >= 0 && offlineContacts[i].id !== this.registerData.id) {
          errors.contact = true;
        }
      }

      if (this.registerData.email) {
        this.registerData.email = this.registerData.email.toLowerCase();

        const i = offlineContacts.findIndex(
          (user) => user.email === this.registerData.email
        );

        if (i >= 0 && offlineContacts[i].id !== this.registerData.id) {
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

      this.addOfflineContact(this.registerData).then((res) => {
        this.Indicator().close();
        this.$refs.modal.show("Success", "Offline contact added", () => {
          this.$router.go(-1);
        });
      });
    },
    async takePicture(selected) {
      const res = await this.$store.dispatch("plugins/TAKE_PHOTO", selected);
      try {
        this.sheet = false;
        if (res) {
          this.registerData.displayPicture = res;
          this.registerData.hasPicture = true;
        } else {
          this.registerData.hasPicture = false;
        }
      } catch (error) {
        this.sheet = false;
        alert(error);
      }
    },
    openCalendar() {
      const options = {
        date: new Date(),
        mode: "date",
        android: {
          theme: 3,
        },
        success: (newDate) => {
          this.registerData.birthday = this.$moment(newDate).format(
            "MM/DD/YYYY"
          );
        },
      };

      cordova.plugins.DateTimePicker.show(options);
    },

    async addOfflineContact(data) {
      try {
        const offlineContacts = JSON.parse(
          localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
        );
        data.id = this.makeId();
        data.isOffline = true;
        data.orders = [];
        data.basket = {
          basketId: this.makeId(),
          items: [],
          totalPrice: null,
        };
        offlineContacts.push(data);
        localStorage.setItem(
          `${AUTH.currentUser.uid}_offline_contacts`,
          JSON.stringify(offlineContacts)
        );

        await this.$store.dispatch("contacts/SYNC_OFFLINE_CUSTOMERS");
        return;
      } catch (error) {
        throw error;
      }
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
.m-top30 {
  margin-top: 30%;
}

image[lazy="loading"] {
  width: 40px;
  height: 300px;
  margin: auto;
}

.input-group.input-group--error label {
  animation: none !important;
}

.icon {
  display: inline-flex !important;
}
</style>
