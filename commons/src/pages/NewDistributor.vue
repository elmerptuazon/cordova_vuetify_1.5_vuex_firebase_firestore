<template>
  <v-container fluid grid-list-md class="pa-4">
    <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field
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
            required
            readonly
            :rules="basicRules"
            @click="openCalendar"
            v-model="registerData.birthday"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-radio-group :rules="basicRules" required v-model="registerData.gender" row>
            <v-radio label="Male" value="Male" color="primary"></v-radio>
            <v-radio label="Female" value="Female" color="primary"></v-radio>
          </v-radio-group>
        </v-flex>
        <v-flex xs12>
          <v-text-field append-icon="email" label="Email address" v-model="registerData.email"></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="mobileRules"
            type="number"
            append-icon="contact_phone"
            required
            label="Mobile number"
            v-model="registerData.contact"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="House"
            v-model="registerData.address.house"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="Street Name"
            v-model="registerData.address.streetName"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-autocomplete
            :rules="basicRules"
            required
            :items="provinces"
            item-value="name"
            label="Province"
            item-text="name"
            v-model="registerData.address.province"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12>
          <v-autocomplete
            :rules="basicRules"
            required
            v-if="registerData.address.province"
            item-value="name"
            :items="cities"
            label="City/Municipality"
            item-text="name"
            v-model="registerData.address.citymun"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="Zip Code"
            v-model="registerData.address.zipCode"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="Tax Identification Number (TIN)"
            v-model="registerData.tin"
          ></v-text-field>
        </v-flex>
      </v-layout>

      <div class="px-4 mt-4">
        <div class="text-xs-center" v-if="registerData.displayPicture">
          <v-img :src="registerData.displayPicture" alt="display_picture"></v-img>
        </div>
        <v-bottom-sheet full-width v-model="sheet">
          <v-btn color="grey darken-1" dark depressed block large slot="activator" type="button">
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
          color="grey darken-1"
          dark
          v-show="registerData.displayPicture"
          despressed
          block
          @click="!registerData.displayPicture"
        >Remove Profile Picture</v-btn>

        <div class="text-xs-center" v-if="registerData.proofOfId">
          <v-img :src="registerData.proofOfId" alt="proof_picture"></v-img>
        </div>
        <v-bottom-sheet full-width v-model="proofPictureSheet">
          <v-btn color="grey darken-1" dark depressed block large slot="activator">
            <div v-if="!registerData.proofOfId">Add Proof of ID</div>
            <div v-else>Change Profile of ID</div>
          </v-btn>
          <v-list>
            <v-subheader>Add using</v-subheader>
            <v-list-tile @click="takeProofPicture('camera')">
              <v-list-tile-avatar>
                <v-icon>camera_alt</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-title>Camera</v-list-tile-title>
            </v-list-tile>
            <v-list-tile @click="takeProofPicture('photo_library')">
              <v-list-tile-avatar>
                <v-icon>photo_library</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-title>Gallery</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-bottom-sheet>
        <v-btn
          color="grey darken-1"
          dark
          flat
          v-show="registerData.proofOfId"
          despressed
          block
          @click="!registerData.proofOfId"
        >Remove Proof of ID</v-btn>

        <v-btn
          :disabled="submitBtnDisabled"
          :loading="submitBtnDisabled"
          depressed
          class="primary white--text"
          block
          large
          type="submit"
        >Submit</v-btn>
      </div>
    </v-form>
    <Dialog />
    <TrialMessage ref="trial" />
    <Modal ref="modal" />
  </v-container>
</template>



<script>
import { mixins } from "@/mixins";
import provinces from "@/assets/provinces.json";
import TrialMessage from "@/components/TrialMessage";
import Modal from "@/components/Modal";

export default {
  components: {
    TrialMessage,
    Modal,
  },
  mounted() {
    // this.$refs.trial.show();
  },
  data: () => ({
    sheet: false,
    proofPictureSheet: false,
    valid: true,
    registerData: {
      firstName: null,
      middleInitial: null,
      lastName: null,
      birthday: null,
      gender: null,
      email: null,
      contact: null,
      tin: null,
      displayPicture: null,
      proofOfId: null,
      address: {
        house: null,
        streetName: null,
        province: null,
        citymun: null,
        zipCode: null,
      },
    },
    birthdayMenu: false,
    pickerValue: null,
    provinces: [],
    cities: [],
    barangays: [],
    submitBtnDisabled: false,
  }),
  created() {
    this.provinces = provinces;

    this.enableBack();
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) {
        this.$refs.modal.show(
          "Sorry",
          "One or more mandatory fields are required"
        );
        return;
      }

      if (!this.registerData.proofOfId) {
        this.$refs.modal.show("Sorry", "Proof of ID is required");
        return;
      }

      this.submitBtnDisabled = true;
      this.disableBack();

      const registerData = JSON.parse(JSON.stringify(this.registerData));
      registerData.createdAt = Date.now();

      registerData.firstName = this.capitalizeFirstLetter(
        registerData.firstName
      );
      registerData.lastName = this.capitalizeFirstLetter(registerData.lastName);
      registerData.middleInitial = this.capitalizeFirstLetter(
        registerData.middleInitial
      );

      if (!registerData.email) {
        const randomString = Math.random().toString(36).substring(7);
        registerData.isEmailAutogenerated = true;
        registerData.email = `${randomString}@appsell.ph`.toLowerCase();
      } else {
        registerData.email = registerData.email.toLowerCase();
      }

      try {
        const response = await this.$store.dispatch(
          "accounts/REGISTER_DISTRIBUTOR",
          registerData
        );

        this.enableBack();
        this.submitBtnDisabled = true;

        this.$refs.modal.show(
          "Success",
          "Please wait for admin approval before you can login to your account."
        );
      } catch (error) {
        console.log(error);

        if (
          error.code === "auth/email-already-in-use" ||
          error.code === "auth/weak-password"
        ) {
          this.$refs.modal.show("Sorry", error.message);
        } else if (error.code === "contact-already-in-use") {
          if (registerData.isEmailAutogenerated) {
            this.submit();
            return;
          }
        } else {
          this.$refs.modal.show("Sorry", "An error occurred");
        }

        this.enableBack();
      }
    },

    async takePicture(selected) {
      try {
        const res = await this.$store.dispatch("plugins/TAKE_PHOTO", selected);
        this.registerData.displayPicture = res;
      } catch (error) {
        this.$refs.modal.show("Sorry", "An error occurred");
        console.log(error);
      }

      this.sheet = false;
    },

    async takeProofPicture(selected) {
      try {
        const res = await this.$store.dispatch("plugins/TAKE_PHOTO", selected);
        this.registerData.proofOfId = res;
      } catch (error) {
        this.$refs.modal.show("Sorry", "An error occurred");
        console.log(error);
      }

      this.proofPictureSheet = false;
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

    disableBack() {
      document.addEventListener(
        "backbutton",
        (e) => {
          e.preventDefault();
        },
        false
      );
    },

    enableBack() {
      document.addEventListener(
        "backbutton",
        (e) => {
          e.preventDefault();
          this.$router.go(-1);
        },
        false
      );
    },

    capitalizeFirstLetter(string) {
      if (!string) return string;
      return string.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
  },
  mixins: [mixins],
  watch: {
    "registerData.address.province"(val) {
      this.cities = provinces.filter((p) => p.name === val)[0].cities;
    },
  },
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

