<template>
  <v-container fluid grid-list-md class="pa-4">
    <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
      <v-layout row wrap>
        <v-flex xs12>
          <v-select
            :rules="basicRules"
            append-icon="person_outline"
            required
            :items="['Customer', 'Reseller']"
            label="I am a..."
            v-model="registerData.type"
            single-line
            menu-props="bottom"
          ></v-select>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="First Name*"
            v-model="registerData.firstName"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="Middle Name*"
            v-model="registerData.middleInitial"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="Last Name*"
            v-model="registerData.lastName"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            label="Birthday*"
            append-icon="date_range"
            required
            :rules="basicRules"
            @focus="openCalendar"
            v-model="registerData.birthday"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-radio-group
            :rules="basicRules"
            required
            v-model="registerData.gender"
            row
          >
            <v-radio label="Male" value="Male" color="primary"></v-radio>
            <v-radio label="Female" value="Female" color="primary"></v-radio>
          </v-radio-group>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="emailRules"
            append-icon="email"
            label="Email address*"
            v-model="registerData.email"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="mobileRules"
            type="number"
            append-icon="contact_phone"
            required
            label="Mobile number*"
            v-model="registerData.contact"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            label="House Number"
            v-model="registerData.address.house"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            label="Street Name*"
            v-model="registerData.address.streetName"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-autocomplete
            :rules="basicRules"
            :items="provinces"
            item-value="name"
            label="Province*"
            item-text="name"
            v-model="registerData.address.province"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12>
          <v-autocomplete
            :rules="basicRules"
            v-if="registerData.address.province"
            item-value="name"
            :items="cities"
            label="City/Municipality*"
            item-text="name"
            v-model="registerData.address.citymun"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            v-if="registerData.address.citymun"
            label="Barangay*"
            v-model="registerData.address.barangay"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            required
            label="Zip Code*"
            v-model="registerData.address.zipCode"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="basicRules"
            label="Facebook URL/Username*"
            required
            v-model="registerData.social.facebook"
          ></v-text-field>
        </v-flex>
        <!--<v-flex xs12>
					<v-text-field label="Instagram URL/Username" v-model="registerData.social.instagram"></v-text-field>
				</v-flex>
				<v-flex xs12>
					<v-text-field label="Twitter URL/Username" v-model="registerData.social.twitter"></v-text-field>
				</v-flex>
				 <v-flex xs12 v-if="registerData.type == 'Reseller'">
					<v-text-field :rules="basicRules" required label="Tax Identification Number" v-model="registerData.tin"></v-text-field>
				</v-flex> -->
        <v-flex xs12>
          <v-text-field
            :rules="passwordRules"
            append-icon="lock_outline"
            required
            label="Password*"
            type="password"
            v-model="registerData.password"
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            :rules="passwordRules"
            append-icon="lock_outline"
            required
            label="Confirm password*"
            type="password"
            v-model="registerData.confirmPassword"
          ></v-text-field>
        </v-flex>
      </v-layout>

      <div class="px-4 mt-4">
        <div class="text-xs-center" v-if="registerData.displayPicture">
          <v-img
            :src="registerData.displayPicture"
            alt="display_picture"
          ></v-img>
        </div>
        <v-bottom-sheet full-width v-model="sheet">
          <v-btn
            color="grey darken-1"
            dark
            depressed
            block
            large
            slot="activator"
            type="button"
          >
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
          @click="registerData.displayPicture = null"
          >Remove Profile Picture</v-btn
        >

        <div v-if="registerData.type == 'Reseller'">
          <div class="text-xs-center" v-if="registerData.proofOfId">
            <v-img :src="registerData.proofOfId" alt="proof_picture"></v-img>
          </div>
          <v-bottom-sheet full-width v-model="proofPictureSheet">
            <v-btn
              color="grey darken-1"
              dark
              depressed
              block
              large
              slot="activator"
            >
              <div v-if="!registerData.proofOfId">Add Proof of ID</div>
              <div v-else>Change Proof of ID</div>
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
            >Remove Proof of ID</v-btn
          >
        </div>
        <br />
        <v-flex xs12>
          <v-checkbox v-model="agree" color="primary">
            <div slot="label">
              I accept the
              <a
                @click.stop="$refs.TermsAndConditionsDialog.show"
                class="blue--text text--darken-2"
                ><strong>Terms</strong></a
              >
              and
              <a
                @click.stop="$refs.DataPolicy.show"
                class="blue--text text--darken-2"
                ><strong>Data Privacy Policies</strong></a
              >
            </div>
          </v-checkbox>
        </v-flex>
        <v-btn
          :disabled="submitBtnDisabled"
          :loading="submitBtnDisabled"
          depressed
          class="primary white--text"
          block
          large
          type="submit"
        >
          <v-icon left>check</v-icon> Submit
        </v-btn>
      </div>
    </v-form>
    <Dialog />
    <TrialMessage ref="trial" />
    <Modal ref="modal" />
    <TermsAndConditionsDialog ref="TermsAndConditionsDialog" />
    <DataPolicy ref="DataPolicy" />
  </v-container>
</template>



<script>
import { mixins } from "@/mixins";
import provinces from "@/assets/provinces.json";
import TrialMessage from "@/components/TrialMessage";
import Modal from "@/components/Modal";
import TermsAndConditionsDialog from "@/components/TermsAndConditionsDialog";
import DataPolicy from "@/components/DataPolicy";

export default {
  components: {
    TrialMessage,
    Modal,
    TermsAndConditionsDialog,
    DataPolicy
  },
  data: () => ({
    sheet: false,
    proofPictureSheet: false,
    valid: true,

    registerData: {
      type: null,
      firstName: null,
      middleInitial: null,
      lastName: null,
      birthday: null,
      gender: null,
      email: null,
      contact: null,
      password: null,
      confirmPassword: null,
      displayPicture: null,
      address: {
        house: null,
        streetName: null,
        province: null,
        citymun: null,
        zipCode: null
      },
      social: {
        facebook: null,
        instagram: null,
        twitter: null
      }
    },
    birthdayMenu: false,
    pickerValue: null,
    provinces: [],
    cities: [],
    barangays: [],
    submitBtnDisabled: false,
    agree: false
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

      if (
        this.registerData.type === "Reseller" &&
        !this.registerData.proofOfId
      ) {
        this.$refs.modal.show("Sorry", "Proof of ID is required.");
        return;
      }

      if (!this.agree) {
        this.$refs.modal.show(
          "Sorry",
          "You must accept our terms and conditions."
        );
        return;
      }

      if (this.registerData.password != this.registerData.confirmPassword) {
        this.$refs.modal.show("Sorry", "Passwords does not match.");
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

      // if (!registerData.email) {
      //   const randomString = Math.random()
      //     .toString(36)
      //     .substring(7);
      //   registerData.isEmailAutogenerated = true;
      //   registerData.email = `${randomString}@appsell.ph`.toLowerCase();
      // } else {
      //   registerData.email = registerData.email.toLowerCase();
      // }
      //provide logic if there is no email, use the phone auth
      //if both are existing then we need to link phone auth and Email Auth
      if (registerData.email) {
        try {
          const response = await this.$store.dispatch(
            "accounts/CREATE_ACCOUNT",
            registerData
          );
          this.startObserversAndProceed(registerData, response);
          this.enableBack();
          this.submitBtnDisabled = true;
        } catch (error) {
          console.log(error);
          if (error.code === "auth/email-already-in-use") {
            if (registerData.isEmailAutogenerated) {
              this.submit();
              return;
            }

            this.$refs.modal.show("Sorry", error.message);
          } else if (error.code === "auth/weak-password") {
            this.$refs.modal.show("Sorry", error.message);
          } else if (
            error.code === "contact-already-in-use" ||
            error.code === "agentId-already-in-use"
          ) {
            this.$refs.modal.show("Sorry", error.message);
          } else {
            this.$refs.modal.show("Sorry", "An error occurred");
          }

          this.submitBtnDisabled = false;
          this.enableBack();
        }
      } else {
        this.$refs.modal.show("Sorry", "Phone Auth is yet to be created");
        return;
      }
    },

    startObserversAndProceed(registerData, response) {
      this.$store.dispatch("orders/LISTEN_TO_PROPOSED_DELIVERIES", {
        id: response.uid
      });

      this.$store.dispatch("catalogues/LISTEN_TO_NEW_CATALOGUES");

      if (this.registerData.type === "Customer") {
        this.$store.commit("SET_TOOLBAR_TITLE", "Add Your Reseller");
        this.$router.push({
          name: "RegisterSuccess",
          params: { response, userType: this.registerData.type }
        });
      } else {
        this.$store.dispatch("orders/LISTEN_TO_ORDERS", { id: response.uid });
        this.$router.push({
          name: "RegisterSuccess",
          params: {
            response,
            userType: this.registerData.type,
            registerData: this.registerData
          }
        });
        this.$store.commit("SET_SHOW_TOOLBAR", false);
      }
    },

    async takePicture(selected) {
      try {
        const res = await this.$store.dispatch(
          "plugins/TAKE_PHOTO_FOR_REGISTRATION",
          selected
        );
        this.registerData.displayPicture = res;
      } catch (error) {
        this.$refs.modal.show("Sorry", "An error occurred");
        console.log(error);
      }

      this.sheet = false;
    },

    async takeProofPicture(selected) {
      try {
        const res = await this.$store.dispatch(
          "plugins/TAKE_PHOTO_FOR_REGISTRATION",
          selected
        );
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
        androidTheme: 3
      };

      datePicker.show(
        options,
        date => {
          this.registerData.birthday = this.$moment(date).format("MM/DD/YYYY");
        },
        error => {
          console.log("cancelled", error);
        }
      );
    },

    disableBack() {
      document.addEventListener(
        "backbutton",
        e => {
          e.preventDefault();
        },
        false
      );
    },

    enableBack() {
      document.addEventListener(
        "backbutton",
        e => {
          e.preventDefault();
          this.$router.go(-1);
        },
        false
      );
    },

    capitalizeFirstLetter(string) {
      if (!string) return string;
      return string.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  },
  mixins: [mixins],
  watch: {
    "registerData.address.province"(val) {
      this.cities = provinces.filter(p => p.name === val)[0].cities;
    },
    "registerData.type"() {
      this.$refs.form.resetValidation();
    }
  }
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

