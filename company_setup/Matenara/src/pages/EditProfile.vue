<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="viewProfile">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-btn
        icon
        flat
        @click="updateUser"
        :loading="updateButtonLoading"
        :disabled="updateButtonLoading"
        v-if="userData.status === 'approved' || userData.type === 'Customer'"
      >
        <v-icon>save</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container fluid grid-list-md>
      <v-layout align-center justify-center row fill-height>
        <v-flex xs6>
          <v-card tile>
            <v-card-title>
              <div>
                <span class="caption grey--text">My Profile Picture</span>
              </div>
            </v-card-title>
            <div class="text-xs-center">
              <v-avatar size="90px" tile>
                <v-img
                  v-if="user.downloadURL"
                  width="90"
                  :src="user.downloadURL"
                  alt="avatar"
                  contain
                ></v-img>
                <v-img
                  v-else
                  width="90"
                  :src="user.imageObj.src"
                  alt="avatar"
                  contain
                ></v-img>
                <v-img
                  contain
                  :src="require('./../../static/img/camera-icon.png')"
                  class="overlayImage"
                  width="30"
                  @click="sheet = true"
                ></v-img>
              </v-avatar>
            </div>
            <br />
          </v-card>
        </v-flex>
        <v-flex xs6 v-if="userData.type === 'Reseller'">
          <v-card tiles>
            <v-card-title>
              <div>
                <span class="caption grey--text">My Proof of ID</span>
              </div>
            </v-card-title>
            <div class="text-xs-center">
              <v-avatar size="90px" tile>
                <v-img
                  width="90"
                  :src="user.proofOfId"
                  alt="avatar"
                  contain
                ></v-img>
                <v-img
                  contain
                  :src="require('./../../static/img/camera-icon.png')"
                  class="overlayImage"
                  width="30"
                  @click="proofOfIdSheet = true"
                ></v-img>
              </v-avatar>
            </div>
            <br />
          </v-card>
        </v-flex>
      </v-layout>

      <v-form v-model="valid" ref="form" lazy-validation>
        <v-layout row wrap>
          <v-flex
            xs12
            v-if="userData.resellerData && userData.type !== 'Reseller'"
          >
            <div>
              <v-list two-line class="transparent" dense>
                <v-list-tile avatar ripple>
                  <v-list-tile-avatar>
                    <v-avatar>
                      <v-img :src="userData.resellerData.downloadURL"></v-img>
                    </v-avatar>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>Your Reseller</v-list-tile-sub-title>
                    <v-list-tile-title class="grey--text text--darken-2">
                      {{ userData.resellerData.firstName }}
                      {{ userData.resellerData.middleInitial }}
                      {{ userData.resellerData.lastName }}
                    </v-list-tile-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn
                      icon
                      ripple
                      v-if="userData.resellerData"
                      @click="
                        $router.push({
                          name: 'EditReseller',
                          params: { action: 'update' }
                        })
                      "
                    >
                      <v-icon color="blue">border_color</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </div>
          </v-flex>
          <v-flex xs7 v-else-if="userData.type === 'Reseller'">
            <!-- Reseller -->
          </v-flex>
          <v-flex xs12 v-else>
            <v-btn
              v-if="!userData.resellerData"
              block
              color="primary"
              depressed
              dark
              @click="
                $router.push({
                  name: 'EditReseller',
                  params: { action: 'add' }
                })
              "
            >
              <v-icon left>add</v-icon>Add your reseller
            </v-btn>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              required
              label="First Name"
              v-model="userData.firstName"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              required
              label="Middle Name"
              v-model="userData.middleInitial"
            ></v-text-field>
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
              required
              readonly
              :rules="basicRules"
              @click="openCalendar"
              v-model="userData.birthday"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-radio-group
              :rules="basicRules"
              required
              v-model="userData.gender"
              row
            >
              <v-radio label="Male" value="Male" color="primary"></v-radio>
              <v-radio label="Female" value="Female" color="pink"></v-radio>
            </v-radio-group>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              append-icon="email"
              label="Email address"
              v-model="placeHolderEmail"
              type="email"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="mobileRules"
              type="number"
              append-icon="contact_phone"
              required
              label="Mobile number"
              v-model="userData.contact"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              label="House Number"
              v-model="userData.address.house"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              label="Street Name"
              v-model="userData.address.streetName"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-autocomplete
              :rules="basicRules"
              :items="provinces"
              item-value="name"
              label="Province"
              item-text="name"
              v-model="userData.address.province"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12>
            <v-autocomplete
              v-if="userData.address.province"
              :rules="basicRules"
              :items="cities"
              @change="populateCities"
              item-value="name"
              label="City/Municipality"
              item-text="name"
              v-model="userData.address.citymun"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              v-if="userData.address.citymun"
              label="Barangay"
              v-model="userData.address.barangay"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              label="Zip Code"
              v-model="userData.address.zipCode"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              :rules="basicRules"
              label="Facebook URL/Username"
              v-model="userData.social.facebook"
            ></v-text-field>
          </v-flex>
          <!-- <v-flex xs12>
						<v-text-field label="Instagram URL/Username" v-model="userData.social.instagram"></v-text-field>
					</v-flex>
					<v-flex xs12>
						<v-text-field label="Twitter URL/Username" v-model="userData.social.twitter"></v-text-field>
          </v-flex>-->
          <v-flex
            xs6
            v-if="
              userData.status === 'approved' || userData.type === 'Customer'
            "
          >
            <v-btn
              block
              depressed
              color="primary"
              class="white--text"
              @click.stop="changePasswordDialog = true"
              >Change Password</v-btn
            >
          </v-flex>
          <v-flex
            xs6
            v-if="
              userData.status === 'approved' || userData.type === 'Customer'
            "
          >
            <v-btn
              block
              color="white"
              depressed
              class="blue--text text--darken-2"
              @click="updateUser"
              :loading="updateButtonLoading"
              :disabled="updateButtonLoading"
              >Save Changes</v-btn
            >
          </v-flex>
          <v-flex xs12 v-if="userData.status === 'denied'">
            <v-btn
              depressed
              class="primary white--text"
              block
              large
              type="submit"
              @click="SaveAndUpdateUser"
              :loading="updateButtonLoading"
              :disabled="updateButtonLoading"
            >
              <v-icon left>check</v-icon>Save and Submit
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-container>
    <!--
    <v-dialog v-model="reAuthDialog">
      <v-card>
        <v-card-title class="py-2">
          <div class="headline mx-auto grey--text text--darken-3">Login</div>
        </v-card-title>
        <v-card-text>
          <p class="text-xs-center pink--text">
            For security purposes, we require users to re-authenticate.
          </p>
          <v-text-field
            label="Password"
            type="password"
            append-icon="lock"
            v-model="reAuthPassword"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            block
            depressed
            color="primary"
            @click="reAuthenticate"
            :loading="reAuthButtonLoading"
            :disabled="reAuthButtonLoading"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    -->
    <v-dialog v-model="changePasswordDialog">
      <v-card>
        <v-card-title>
          <div class="headline mx-auto grey--text text--darken-3">
            Change Password
          </div>
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Old Password"
            type="password"
            append-icon="lock"
            v-model="passwords.old"
          ></v-text-field>
          <v-text-field
            label="Password"
            type="password"
            append-icon="lock"
            v-model="passwords.password"
          ></v-text-field>
          <v-text-field
            label="Confirm Password"
            type="password"
            append-icon="lock"
            v-model="passwords.confirm"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            block
            depressed
            color="primary"
            @click="updatePassword"
            :loading="updatePasswordButtonLoading"
            :disabled="updatePasswordButtonLoading"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar bottom v-model="snackbar">{{ snackbarMessage }}</v-snackbar>

    <Dialog />

    <v-bottom-sheet full-width v-model="sheet">
      <v-list>
        <v-subheader v-if="!user.downloadURL">Add using</v-subheader>
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
    <v-bottom-sheet full-width v-model="proofOfIdSheet">
      <v-list>
        <v-subheader>Update using</v-subheader>
        <v-list-tile @click="takeProofOfIdPicture('camera')">
          <v-list-tile-avatar>
            <v-icon>camera_alt</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title>Camera</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="takeProofOfIdPicture('photo_library')">
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
import provinces from "@/assets/provinces.json";
import Modal from "@/components/Modal";
import MaleDefaultImage from "@/assets/img/male-default.jpg";
export default {
  data: () => ({
    userData: {
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
        zipCode: null,
      },
      social: {
        facebook: null,
        instagram: null,
        twitter: null,
      },
    },
    reAuthDialog: false,
    reAuthPassword: null,
    snackbar: false,
    snackbarMessage: null,
    reAuthButtonLoading: false,
    updateButtonLoading: false,
    updatePwordButtonLoading: false,
    valid: true,
    updatePasswordButtonLoading: false,
    changePasswordDialog: false,
    passwords: {
      old: null,
      password: null,
      confirm: null
    },
    sheet: false,
    proofOfIdSheet: false,
    profileImage: {
      width: null,
      height: null
    },
    provinces: [],
    cities: [],
    barangays: [],
    placeHolderEmail: null,
    modal: false,
    menu: false,
    date: null
  }),
  watch: {
    // "userData.address.province"(val) {
    //   console.log('province', val);
    //   this.cities = Provinces.filter(p => p.name === val)[0].cities;
    // }
  },
  created() {
    console.log("userData:", this.userData);
    console.log("user:", this.user);

    this.userData = Object.assign({}, this.userData, this.user);
    console.log(this.userData);
    this.provinces = provinces;
    const val = this.userData.address.province;
    this.cities = Provinces.filter(p => p.name === val)[0].cities;

    if (this.userData.isEmailAutogenerated) {
      this.placeHolderEmail = null;
    } else {
      this.placeHolderEmail = this.userData.email;
    }

    if (
      !this.userData.hasOwnProperty("hasPicture") ||
      !this.userData.hasPicture
    ) {
      this.userData.resellerData.downloadURL = MaleDefaultImage;
    }
    console.log(this.userData);
    // this.reAuthDialog = true;
  },
  methods: {
    viewProfile() {
      this.$router.go(-1);
    },

    async updateUser() {
      if (!this.$refs.form.validate()) {
        this.$refs.modal.show(
          "Sorry",
          "One or more mandatory fields are required"
        );
        return;
      }

      this.updateButtonLoading = true;

      try {
        if (this.userData.isEmailAutogenerated) {
          if (this.placeHolderEmail) {
            this.userData.isEmailAutogenerated = false;
            this.userData.email = this.placeHolderEmail;
          }
        } else {
          this.userData.email = this.placeHolderEmail;
        }

        this.userData.firstName = this.capitalizeFirstLetter(
          this.userData.firstName
        );
        this.userData.lastName = this.capitalizeFirstLetter(
          this.userData.lastName
        );
        this.userData.middleInitial = this.capitalizeFirstLetter(
          this.userData.middleInitial
        );

        await this.$store.dispatch("accounts/UPDATE_ACCOUNT", this.userData);
        this.$refs.modal.show(
          "Success",
          "Your account has been successfully updated",
          () => {
            this.viewProfile();
          }
        );
      } catch (error) {
        let msg;
        if (error.code === "auth/requires-recent-login") {
          this.reAuthDialog = true;
        } else if (error.message === "Contact number already exists.") {
          msg = "Contact number already exists, please try again.";
        } else {
          msg = "Account update error, please try again.";
        }

        this.$refs.modal.show("Sorry", msg, () => {
          console.log(error.message);
          this.viewProfile();
        });
      }

      this.updateButtonLoading = false;
    },

    async SaveAndUpdateUser() {
      if (!this.$refs.form.validate()) {
        this.$refs.modal.show(
          "Sorry",
          "One or more mandatory fields are required"
        );
        return;
      }

      this.updateButtonLoading = true;

      try {
        if (this.userData.isEmailAutogenerated) {
          if (this.placeHolderEmail) {
            this.userData.isEmailAutogenerated = false;
            this.userData.email = this.placeHolderEmail;
          }
        } else {
          this.userData.email = this.placeHolderEmail;
        }

        this.userData.firstName = this.capitalizeFirstLetter(
          this.userData.firstName
        );
        this.userData.lastName = this.capitalizeFirstLetter(
          this.userData.lastName
        );
        this.userData.middleInitial = this.capitalizeFirstLetter(
          this.userData.middleInitial
        );

        await this.$store.dispatch("accounts/UPDATE_ACCOUNT", this.userData);

        await this.$store.dispatch("accounts/RESUBMIT_STATUS");

        this.$refs.modal.show(
          "Success",
          "Your account has been successfully resubmitted",
          () => {
            this.viewProfile();
          }
        );
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          this.reAuthDialog = true;
        } else {
          this.$refs.modal.show("Sorry", "Account update error", () => {
            console.log(error.message);
            this.viewProfile();
          });
        }
      }

      this.updateButtonLoading = false;
    },

    reAuthenticate() {
      if (!this.reAuthPassword) {
        return false;
      }

      this.reAuthButtonLoading = true;
      this.$store
        .dispatch("accounts/RE_AUTHENTICATE_USER", this.reAuthPassword)
        .then(() => {
          this.reAuthPassword = null;
          this.reAuthDialog = false;
          this.reAuthButtonLoading = false;
          this.$refs.modal.show(
            "Success",
            "You may now continue your request."
          );
        })
        .catch(e => {
          console.log(e);
          this.reAuthButtonLoading = false;
          this.$refs.modal.show("Error", "Your password is incorrect.");
        });
    },

    updatePassword() {
      if (this.passwords.password !== this.passwords.confirm) {
        this.snackbarMessage = "Passwords did not match.";
        this.snackbar = true;
      } else if (
        !this.passwords.password ||
        !this.passwords.confirm ||
        !this.passwords.old
      ) {
        this.snackbarMessage = "All fields are required.";
        this.snackbar = true;
      } else {
        this.updatePasswordButtonLoading = true;
        this.$store
          .dispatch("accounts/RE_AUTHENTICATE_USER", this.passwords.old)
          .then(() => {
            console.log("RE-AUTHENTICATION SUCCESS!");
            return this.$store.dispatch(
              "accounts/UPDATE_PASSWORD",
              this.passwords.password
            );
          })
          .then(() => {
            this.passwords = {
              old: null,
              password: null,
              confirm: null
            };
            this.updatePasswordButtonLoading = false;
            this.changePasswordDialog = false;
            this.$events.$emit("SET_DIALOG", {
              status: true,
              title: "Success",
              message: "You password has been updated."
            });
          })
          //catch block for RE-AUTH action
          .catch(e => {
            this.updatePasswordButtonLoading = false;

            let errMessage;
            if (e.code === "auth/wrong-password")
              errMessage = '"Old Password" is incorrect, please try again...';
            else errMessage = e.message;

            this.$events.$emit("SET_DIALOG", {
              status: true,
              title: "Sorry",
              message: errMessage
            });
          });
      }
    },

    takePicture(selected) {
      this.$store
        .dispatch("plugins/TAKE_PHOTO_FOR_REGISTRATION", selected)
        .then(res => {
          this.sheet = false;
          if (res) {
            this.$store
              .dispatch("accounts/UPDATE_PROFILE_PHOTO", res)
              .then(() => {
                this.createFakeImage(this.user.imageObj.src).then(data => {
                  this.profileImage = {
                    height: data.height + "px",
                    width: data.width + "px"
                  };
                });
              })
              .catch(e => {
                console.error(e);
              });
          }
        })
        .catch(error => {
          this.sheet = false;
          alert(error);
        });
    },
    takeProofOfIdPicture(selected) {
      this.$store
        .dispatch("plugins/TAKE_PHOTO_FOR_REGISTRATION", selected)
        .then(res => {
          this.proofOfIdSheet = false;
          if (res) {
            this.$store
              .dispatch("accounts/UPDATE_PROOF_OF_ID", res)
              .catch(e => {
                console.error(e);
              });
          }
        })
        .catch(error => {
          this.proofOfIdSheet = false;
          alert(error);
        });
    },

    openCalendar() {
      const options = {
        date: new Date(),
        mode: "date",
        android: {
          theme: 3
        },
        success: newDate => {
          this.userData.birthday = this.$moment(newDate).format("MM/DD/YYYY");
        }
      };

      cordova.plugins.DateTimePicker.show(options);
    },

    capitalizeFirstLetter(string) {
      if (!string) return string;
      return string.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },

    populateCities() {
      const val = this.userData.address.province;
      if(this.userData.address.citymun) this.userData.address.citymun = null;
      this.cities = provinces.filter(p => p.name === val)[0].cities;
    }
  },
  computed: {
    ...mapGetters({
      user: "accounts/user"
    }),
  },
  watch: {},
  components: {
    Modal
  },
  mixins: [mixins]
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
  top: 4%;
  left: calc(50% - 4.8%);
  z-index: 1;
}

.inner-image {
  position: relative;
  width: 70%;
}

.icon {
  display: inline-flex !important;
}
.overlayImage {
  position: absolute;
  z-index: 1;
}
</style>
