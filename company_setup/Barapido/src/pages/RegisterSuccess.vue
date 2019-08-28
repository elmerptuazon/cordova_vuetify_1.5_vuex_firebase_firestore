<template>
  <v-container>
    <div
      id="reseller-container"
      class="mt-5 text-xs-center"
      v-if="userType === 'Reseller'"
    >
      <p class="headline blue--text text--darken-2">
        Your application has been submitted!
      </p>
      <p class="subheading blue--text text--darken-2">
        please verify your email address by clicking the link on the email we
        have sent.
      </p>
      <v-avatar
        :tile="true"
        size="92px"
        class="grey lighten-4"
        v-if="registerData.imageObj.src"
      >
        <v-img
          class="mt-2 elevation-1 flipped"
          :src="registerData.imageObj.src"
        ></v-img>
      </v-avatar>
      <p class="grey--text text--darken-2 mt-4 subheading text-xs-center">
        {{ fullName }}
      </p>
      <CheckMark />
      <v-btn flat color="primary" class="mt-5" @click="goToTabs"
        >Continue</v-btn
      >
    </div>

    <div
      id="customer-container"
      class="mt-2"
      v-else-if="userType === 'Customer'"
    >
      <div class="text-xs-center">
        <p class="headline blue--text text--darken-2">
          Your Registration is almost complete!
        </p>
      </div>

      <v-form
        v-model="resellerValid"
        ref="resellerForm"
        lazy-validation
        @submit.prevent="findReseller"
      >
        <v-text-field
          :clearable="resellerFound"
          :rules="basicRules"
          required
          label="Email address or Mobile number"
          v-model="resellerSearch"
        ></v-text-field>
        <p class="grey--text text--darken-2 mt-4 subheading text-xs-center">
          {{
            `${resellerDetails.firstName ||
              "Your"} ${resellerDetails.middleInitial ||
              ""} ${resellerDetails.lastName || "Reseller"}`
          }}
        </p>
        <div class="text-xs-center">
          <v-avatar :tile="true" size="92px" class="grey lighten-4">
            <v-img
              class="elevation-1 flipped"
              :src="resellerDetails.downloadURL"
            ></v-img>
          </v-avatar>
        </div>
        <div class="mt-5 px-5">
          <v-btn
            depressed
            type="submit"
            color="primary"
            block
            large
            v-show="!resellerFound"
            >Find Your Reseller</v-btn
          >
          <v-btn
            depressed
            type="button"
            color="primary"
            block
            large
            v-show="resellerFound"
            @click="confirmReseller"
            >Confirm Reseller</v-btn
          >
          <div class="mt-4 text-xs-center">
            <v-btn flat type="button" color="primary" @click="goToTabs"
              >Maybe Later</v-btn
            >
          </div>
        </div>
      </v-form>
    </div>
    <Modal ref="modal" />
    <Dialog />
  </v-container>
</template>


<script>
import { mixins } from "@/mixins";
import Modal from "@/components/Modal";
import defaultMaleImage from "@/assets/img/male-default.jpg";
import defaultFemaleImage from "@/assets/img/female-default.jpg";

export default {
  data: () => ({
    imgObj: {
      src: null,
      loading: require("../../static/img/spinner.gif"),
      error: require("../../static/img/default-profpic.png")
    },
    userType: null,
    resellerSearch: null,
    resellerDetails: {
      fullName: null,
      id: null,
      customers: []
    },
    resellerValid: true,
    resellerFound: false,
    customerId: null,
    registerData: {
      firstName: null,
      middleInitial: null,
      lastName: null
    }
  }),
  methods: {
    findReseller() {
      if (this.$refs.resellerForm.validate()) {
        this.Indicator().open();
        this.$store
          .dispatch("accounts/FIND_RESELLER", {
            data: this.resellerSearch
          })
          .then(res => {
            if (!res.empty) {
              res.data.fullName = `${res.data.firstName} ${res.data.middleInitial} ${res.data.lastName}`;
              this.resellerDetails = Object.assign({}, res.data);
              this.$store
                .dispatch("accounts/GET_PROFILE_PICTURE", res.data.uid)
                .then(imageData => {
                  if (imageData.success) {
                    this.imgObj.src = imageData.url;
                  } else {
                    this.imgObj.src =
                      res.data.gender === "Male"
                        ? defaultMaleImage
                        : defaultFemaleImage;
                  }
                  this.resellerFound = true;
                })
                .catch(error => {
                  this.$events.$emit("SET_DIALOG", {
                    status: true,
                    title: "Find Reseller Error",
                    message: "An error occurred."
                  });

                  console.log(error);
                });
              this.Indicator().close();
            } else {
              this.Indicator().close();
              this.$events.$emit("SET_DIALOG", {
                status: true,
                title: "Sorry",
                message: "No reseller found."
              });
            }
          })
          .catch(error => {
            this.resetReseller();
            this.Indicator().close();
            this.$events.$emit("SET_DIALOG", {
              status: true,
              title: "Find Reseller Error",
              message: "An error occurred."
            });
            console.error("ERROR!", error);
          });
      }
    },
    confirmReseller() {
      this.$store
        .dispatch("accounts/ADD_CUSTOMER_TO_RESELLER", {
          customers: this.resellerDetails.customers,
          resellerId: this.resellerDetails.uid,
          customerId: this.customerId
        })
        .then(() => {
          console.log("reseller added");
          this.$refs.modal.show(
            "Success",
            "You registration is complete, please login again.",
            () => {
              this.$store.dispatch("accounts/LOG_OUT").then(() => {
                this.Indicator().close();
                this.$router.push({ name: "Home" });
              });
            }
          );
          //   this.$router.push({ name: "Catalogue" });
        })
        .catch(error => {
          console.error(error);
        });
    },
    resetReseller() {
      this.resellerSearch = null;
      this.resellerId = null;
      this.resellerFullName = null;
      this.imgObj.src = "";
      this.resellerDetails = {};
      this.resellerFound = false;
    },
    goToTabs() {
      // if (this.userType === 'Reseller') {
      // 	this.$router.push({name: 'More'})
      // } else {
      // 	this.$router.push({name: 'Catalogue'});
      // }
      this.$refs.modal.show(
        "Success",
        "You registration is complete, please login again.",
        () => {
          this.$store.dispatch("accounts/LOG_OUT").then(() => {
            this.Indicator().close();
            this.$router.push({ name: "Home" });
          });
        }
      );
    }
  },
  created() {
    const routeParams = this.$route.params;

    this.userType = routeParams.userType;
    this.customerId = routeParams.response.uid;

    if (routeParams.hasOwnProperty("registerData")) {
      this.registerData = Object.assign({}, routeParams.response);
      console.log(this.registerData);
    }
  },
  computed: {
    fullName() {
      return `${this.registerData.firstName} ${this.registerData
        .middleInitial || ""} ${this.registerData.lastName}`;
    }
  },
  watch: {
    resellerSearch() {
      if (!this.resellerSearch) {
        this.resetReseller();
      }
    }
  },
  mixins: [mixins],
  components: {
    Modal
  }
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
</style>
