<template>
  <v-container fluid grid-list-md class="pa-4">
    <v-stepper v-model="frame">
      <v-stepper-header>
        <v-stepper-step :complete="frame > 1" step="1"
          >Personal Information</v-stepper-step
        >
        <v-divider></v-divider>

        <v-stepper-step :complete="frame > 2" step="2"
          >Home Address</v-stepper-step
        >
        <v-divider></v-divider>

         <v-stepper-step :complete="frame > 3" step="3"
          >Account Details</v-stepper-step
        >
        <v-divider></v-divider>

        <v-stepper-step :complete="frame > 4" step="4"
          >Referral / Reseller Details</v-stepper-step
        >
        <v-divider></v-divider>

        <v-stepper-step step="5"
          >Upload Profile Pic and Proof of ID</v-stepper-step
        >
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-form ref="form1" lazy-validation @submit.prevent="proceed(1)">
            <v-layout row wrap>
              <v-flex xs12>
                <div class="font-weight-bold text-center">
                  Personal Information
                </div>
              </v-flex>
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
                  <v-radio
                    label="Female"
                    value="Female"
                    color="primary"
                  ></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs12>
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  depressed
                  :disabled="!registerData.gender"
                >
                  Proceed
                  <v-icon right>arrow_forward</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-form>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-form ref="form2" lazy-validation @submit.prevent="proceed(2)">
            <v-layout row wrap>
              <v-flex xs12>
                <div class="font-weight-bold text-center">Home Address</div>
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
            </v-layout>
            <v-spacer />
            <v-btn depressed outline @click="frame -= 1">BACK</v-btn>
            <v-btn
              type="submit"
              depressed
              color="primary"
              :disabled="!registerData.address.zipCode"
            >
              Proceed
              <v-icon right>arrow_forward</v-icon>
            </v-btn>
          </v-form>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-form
            ref="form4"
            lazy-validation
            @submit.prevent="confirmationDialog = true"
          >
            <v-layout row wrap>
              <v-flex xs12>
                <div class="font-weight-bold text-center">Account Details</div>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  :rules="basicRules"
                  label="Facebook URL/Username*"
                  required
                  v-model="registerData.social.facebook"
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
                  :rules="emailRules"
                  append-icon="email"
                  label="Email address*"
                  v-model="registerData.email"
                  type="email"
                ></v-text-field>
              </v-flex>
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
              <v-flex xs12>
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  depressed
                  :disabled="submitBtnDisabled || !registerData.confirmPassword"
                  :loading="submitBtnDisabled"
                >
                  Submit Details and Proceed
                  <v-icon right>arrow_forward</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs12>
                <v-btn block depressed outline @click="frame -= 1">BACK</v-btn>
              </v-flex>
            </v-layout>
          </v-form>
        </v-stepper-content>

        <v-stepper-content step="4">
          <v-layout row wrap>
            <v-flex xs12>
              <div class="font-weight-bold text-center" v-if="registerData.type === 'Reseller'">Referred By</div>
              <div class="font-weight-bold text-center" v-else>Reseller Details</div>
            </v-flex>
            
            <v-flex xs12 mt-3>
              <v-text-field
                clearable
                label="Email address or Membership ID"
                v-model="referralSearch"
                @click:clear="clearReferralField"
              ></v-text-field>
            </v-flex>

            <v-flex xs12 mt-3>
              <p v-if="registerData.type === 'Reseller'" class="grey--text text--darken-2 mt-4 subheading text-xs-center">
                {{
                  `${referralBy.firstName ||
                    "Your"} ${referralBy.middleInitial ||
                    ""} ${referralBy.lastName || "Referrer"}`
                }}
              </p>
              <p v-else class="grey--text text--darken-2 mt-4 subheading text-xs-center">
                {{
                  `${referralBy.firstName ||
                    "Your"} ${referralBy.middleInitial ||
                    ""} ${referralBy.lastName || "Reseller"}`
                }}
              </p>
              <div class="text-xs-center">
                <v-avatar :tile="true" size="92px" class="grey lighten-4">
                  <v-img :src="imgObj.src"></v-img>
                </v-avatar>
              </div>
            </v-flex>
          </v-layout>
          
          <v-layout row wrap mt-2 mb-4 align-center>
            <v-btn
              depressed
              @click="findReferral"
              color="primary"
              :loading="btnLoading"
              :disabled="btnLoading || !referralSearch"
              block
              v-show="!referralFound"
              >
                <span v-if="registerData.type === 'Reseller'">Find Your Referrer</span>
                <span v-else>Find your Reseller</span>
            </v-btn>
            <v-btn
              depressed
              color="primary"
              block
              v-show="referralFound"
              @click="confirmReferral"
              :loading="btnLoading"
              :disabled="btnLoading"
              >
                <span v-if="registerData.type === 'Reseller'">Confirm Your Referrer</span>
                <span v-else>Confirm your Reseller</span>
                <v-icon right>arrow_forward</v-icon>
            </v-btn>
          </v-layout>

          <v-layout row wrap mt-4 align-center justify-center>
            <v-flex xs5>
              <v-btn depressed outline @click="frame -= 1">BACK</v-btn>
            </v-flex>

            <v-flex xs6>
              <v-btn depressed outline color="primary" @click="proceed(4)">SKIP FOR NOW</v-btn>
            </v-flex>
          </v-layout>
        </v-stepper-content>

        <v-stepper-content step="5">
          <div class="px-4 mt-4">
            <v-flex xs12>
              <div
                v-if="registerData.type == 'Reseller'"
                class="font-weight-bold text-center"
              >
                Upload Profile Pic and Proof of ID
              </div>
              <div v-else class="font-weight-bold text-center">
                Upload Profile Pic
              </div>
            </v-flex>
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
                <div v-if="!registerData.displayPicture">
                  Add Profile Picture
                </div>
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
                <v-img
                  :src="registerData.proofOfId"
                  alt="proof_picture"
                ></v-img>
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
          </div>
          <div>
            <v-btn
              color="primary"
              block
              depressed
              @click="submitPhotoId"
              :disabled="submitBtnDisabled"
              :loading="submitBtnDisabled"
            >
              SUBMIT
              <v-icon>done_all</v-icon>
            </v-btn>
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <v-dialog v-model="confirmationDialog" persistent>
      <v-card>
        <v-card-title class="subheading font-weight-bold primary white--text"
          >SUBMIT ACCOUNT DETAILS</v-card-title
        >
        <v-card-text>
          You are about to submit your account details, are you sure about it?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn block outline @click.native="confirmationDialog = false"
            >Cancel</v-btn
          >
          <v-btn block color="primary" dark depressed @click.native="submitInfo"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
      <v-layout row wrap>
        <v-flex xs12>
					<v-text-field label="Instagram URL/Username" v-model="registerData.social.instagram"></v-text-field>
				</v-flex>
				<v-flex xs12>
					<v-text-field label="Twitter URL/Username" v-model="registerData.social.twitter"></v-text-field>
				</v-flex>
				 <v-flex xs12 v-if="registerData.type == 'Reseller'">
					<v-text-field :rules="basicRules" required label="Tax Identification Number" v-model="registerData.tin"></v-text-field>
				</v-flex>
      </v-layout>

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
    </v-form> -->

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
    frame: 1,
    confirmationDialog: false,
    confirm: false,

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
    agree: false,

    referralSearch: null,
    referralBy: {},
    imgObj: {},
    referralFound: false,
    btnLoading: false,

  }),
  created() {
    this.provinces = provinces;

    this.enableBack();
  },
  methods: {
    proceed(currentFrame) {
      if (!this.$refs.form1.validate() && currentFrame === 1) {
        this.$refs.form1.modal.show(
          "Sorry",
          "One or more mandatory fields are required"
        );
        return;
      }

      if (!this.$refs.form2.validate() && currentFrame === 2) {
        this.$refs.form2.modal.show(
          "Sorry",
          "One or more mandatory fields are required"
        );
        return;
      }

      this.$refs.form1.resetValidation();
      this.$refs.form2.resetValidation();
      this.frame++;
    },
    clearReferralField() {
      this.referralSearch = null;
      this.referralBy = {};
      this.referralFound = false;
      this.imgObj = {};
    },
    async submitInfo() {
      this.confirmationDialog = false;

      if (!this.$refs.form4.validate()) {
        this.$refs.modal.show(
          "Sorry",
          "One or more mandatory fields are required"
        );
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

      this.registerData.hasPicture = null;
      this.registerData.displayPicture = null;
      this.registerData.proofOfId = null;

      if(this.registerData.type === "Reseller") {
        this.registerData.referredById = null;
      }
      
      const registerData = JSON.parse(JSON.stringify(this.registerData));
      registerData.createdAt = Date.now();

      registerData.firstName = this.capitalizeFirstLetter(
        registerData.firstName
      );
      registerData.lastName = this.capitalizeFirstLetter(registerData.lastName);
      registerData.middleInitial = this.capitalizeFirstLetter(
        registerData.middleInitial
      );

      if (registerData.email) {
        registerData.email = registerData.toLowerCase();

        try {
          const response = await this.$store.dispatch(
            "accounts/CREATE_ACCOUNT",
            registerData
          );
          // this.startObserversAndProceed(registerData, response);
          this.enableBack();
          this.submitBtnDisabled = false;
          this.registerData = response;

          this.frame++;
        } catch (error) {
          console.log(error);
          if (error.code === "auth/email-already-in-use") {
            if (registerData.isEmailAutogenerated) {
              this.submitInfo();
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
        this.submitBtnDisabled = false;
        this.enableBack();
      }
    },
    async findReferral() {
      this.Indicator().open();

      let res;
      try {
        res = await this.$store.dispatch("accounts/FIND_RESELLER", { data: this.referralSearch.toLowerCase() });
      }
      catch(error) {
        console.log(error);
        this.Indicator().close();
        this.$refs.modal.show(
          "Sorry",
          "There was an error while retrieving the reseller..."
        );
        return;
      }

      console.log(res);
      if(!res.empty) {
        this.Indicator().close();
        this.referralFound = true;
        const reseller = res.data;

        this.referralBy.firstName = reseller.firstName;
        this.referralBy.middleInitial = reseller.middleInitial;
        this.referralBy.lastName = reseller.lastName;
        this.referralBy.uid = reseller.uid;
        this.referralBy.agentId = reseller.agentId;
        this.referralBy.email = reseller.email;
        this.referralBy.customers = reseller.customers;

        this.imgObj.src =
          reseller.downloadURL || MaleDefaultImage;
        
        console.log(this.imgObj);
      }
      else {
        this.Indicator().close();
        this.referralFound = false;
        this.$refs.modal.show(
          "Sorry",
          "No reseller was found. Please try again."
        );
      }
    },
    async confirmReferral() {
      if(this.registerData.type === 'Reseller') {
        this.Indicator().open();

        this.registerData.referredById = this.referralBy.uid;

        try {
          await this.$store.dispatch("accounts/ADD_REFERRED_BY_TO_RESELLER", {
            referredById: this.referralBy.uid,
            referrersEmail: this.referralBy.email,
            uid: this.registerData.uid,
          });
        }
        catch(error) {
          console.log(error);
          this.Indicator().close();
          this.$refs.modal.show(
            "Confirm Referral error",
            "Unexpected error occurred. Please try again.",
          );
          return;
        }

        this.Indicator().close();
        this.$refs.modal.show(
          "Success!",
          "Your referral was added successfully!",
        );
        this.frame++;
      }
      else {
        delete this.registerData.referralBy;
        const payload = {
          customers: this.referralBy.customers,
          customerId: this.registerData.uid,
          resellerId: this.referralBy.uid,
          resellerData: this.referralBy
        };

        this.Indicator().open();

        try {
          await this.$store.dispatch("accounts/ADD_CUSTOMER_TO_RESELLER", payload);

          this.Indicator().close();
          this.$refs.modal.show(
            "Success",
            "Your reseller has been updated.",
          );
          this.frame++;
        }
        catch(error) {
          console.log(error);
          this.Indicator().close();
          this.$refs.modal.show(
            "Confirm reseller error",
            "Unexpected error occurred. Please try again.",
          );
        }
      }
    },
    async submitPhotoId() {
      if (
        this.registerData.type === "Reseller" &&
        !this.registerData.proofOfId
      ) {
        this.$refs.modal.show("Sorry", "Proof of ID is required.");
        return;
      }

      this.submitBtnDisabled = true;

      if (this.registerData.type === "Reseller") {
        try {
          await this.$store.dispatch(
            "accounts/UPLOAD_PROOF_OF_ID",
            this.registerData
          );
        } catch (error) {
          this.$refs.modal.show("Sorry", "An error occured. Please Try Again.");
          this.submitBtnDisabled = false;
          console.log(error);
          return;
        }
      }

      try {
        const response = await this.$store.dispatch(
          "accounts/UPLOAD_PROFILE_PHOTO",
          this.registerData
        );
        this.submitBtnDisabled = false;
        this.startObserversAndProceed(this.registerData, response);
      } catch (error) {
        this.$refs.modal.show("Sorry", "An error occured. Please Try Again.");
        this.submitBtnDisabled = false;

        console.log(error);
        return;
      }
    },

    // async submit() {
    //   if (!this.$refs.form.validate()) {
    //     this.$refs.modal.show(
    //       "Sorry",
    //       "One or more mandatory fields are required"
    //     );
    //     return;
    //   }

    //   if (
    //     this.registerData.type === "Reseller" &&
    //     !this.registerData.proofOfId
    //   ) {
    //     this.$refs.modal.show("Sorry", "Proof of ID is required.");
    //     return;
    //   }

    //   if (!this.agree) {
    //     this.$refs.modal.show(
    //       "Sorry",
    //       "You must accept our terms and conditions."
    //     );
    //     return;
    //   }

    //   if (this.registerData.password != this.registerData.confirmPassword) {
    //     this.$refs.modal.show("Sorry", "Passwords does not match.");
    //     return;
    //   }

    //   this.submitBtnDisabled = true;
    //   this.disableBack();

    //   const registerData = JSON.parse(JSON.stringify(this.registerData));
    //   registerData.createdAt = Date.now();

    //   registerData.firstName = this.capitalizeFirstLetter(
    //     registerData.firstName
    //   );
    //   registerData.lastName = this.capitalizeFirstLetter(registerData.lastName);
    //   registerData.middleInitial = this.capitalizeFirstLetter(
    //     registerData.middleInitial
    //   );

    //   registerData.displayPicture = null;
    //   registerData.proofOfId = null;
    //   // if (!registerData.email) {
    //   //   const randomString = Math.random()
    //   //     .toString(36)
    //   //     .substring(7);
    //   //   registerData.isEmailAutogenerated = true;
    //   //   registerData.email = `${randomString}@appsell.ph`.toLowerCase();
    //   // } else {
    //   //   registerData.email = registerData.email.toLowerCase();
    //   // }
    //   //provide logic if there is no email, use the phone auth
    //   //if both are existing then we need to link phone auth and Email Auth
    //   if (registerData.email) {
    //     try {
    //       const response = await this.$store.dispatch(
    //         "accounts/CREATE_ACCOUNT",
    //         registerData
    //       );
    //       // this.startObserversAndProceed(registerData, response);
    //       this.enableBack();
    //       this.submitBtnDisabled = false;
    //       this.frame++;

    //     } catch (error) {
    //       console.log(error);
    //       if (error.code === "auth/email-already-in-use") {
    //         if (registerData.isEmailAutogenerated) {
    //           this.submitInfo();
    //           return;
    //         }

    //         this.$refs.modal.show("Sorry", error.message);
    //       } else if (error.code === "auth/weak-password") {
    //         this.$refs.modal.show("Sorry", error.message);
    //       } else if (
    //         error.code === "contact-already-in-use" ||
    //         error.code === "agentId-already-in-use"
    //       ) {
    //         this.$refs.modal.show("Sorry", error.message);
    //       } else {
    //         this.$refs.modal.show("Sorry", "An error occurred");
    //         console.log(error.message);
    //       }

    //       this.submitBtnDisabled = false;
    //       this.enableBack();
    //     }
    //   } else {
    //     this.$refs.modal.show("Sorry", "Phone Auth is yet to be created");
    //     this.enableBack();
    //     this.submitBtnDisabled = false;
    //     return;
    //   }
    // },

    startObserversAndProceed(registerData, response) {
      this.$store.dispatch("accounts/START_OBSERVERS", registerData);
      this.$store.dispatch("orders/LISTEN_TO_PROPOSED_DELIVERIES", {
        id: response.uid
      });

      this.$store.dispatch("catalogues/LISTEN_TO_NEW_CATALOGUES");

      if (this.registerData.type === "Customer") {
        this.$router.push({
          name: "RegisterSuccess",
          params: {
            response,
            userType: this.registerData.type,
            registerData: this.registerData
          }
        });
        this.$store.commit("SET_SHOW_TOOLBAR", true);
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
      this.$refs.form1.resetValidation();
      this.$refs.form2.resetValidation();
      this.$refs.form3.resetValidation();
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

