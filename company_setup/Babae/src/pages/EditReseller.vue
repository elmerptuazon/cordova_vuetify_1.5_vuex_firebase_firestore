<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles"
        >{{ action }} Your Reseller</v-toolbar-title
      >
    </v-toolbar>
    <v-container fluid>
      <div id="customer-container" class="mt-2">
        <v-form v-model="resellerValid" ref="resellerForm" lazy-validation>
          <v-text-field
            :clearable="resellerFound"
            :rules="basicRules"
            required
            label="Email address or Membership ID"
            v-model="resellerSearch"
            type="email"
          ></v-text-field>
          <p 
            class="grey--text text--darken-2 mt-4 subheading text-xs-center" 
            v-if="user.type === 'Reseller'"
          >
            {{
              `${resellerDetails.firstName ||
                "Your"} ${resellerDetails.middleInitial ||
                ""} ${resellerDetails.lastName || "Referrer"}`
            }}
          </p>
          <p 
            class="grey--text text--darken-2 mt-4 subheading text-xs-center"
            v-else
          >
            {{
              `${resellerDetails.firstName ||
                "Your"} ${resellerDetails.middleInitial ||
                ""} ${resellerDetails.lastName || "Reseller"}`
            }}
          </p>
          <div class="text-xs-center">
            <v-avatar :tile="true" size="92px" class="grey lighten-4">
              <v-img :src="imgObj.src"></v-img>
            </v-avatar>
          </div>
          <div class="mt-5 px-5">
            <v-btn
              depressed
              @click="findReseller"
              color="primary"
              :loading="btnLoading"
              :disabled="btnLoading"
              block
              large
              v-show="!resellerFound"
              >
                <span v-if="user.type === 'Reseller'">Find Your Referrer</span>
                <span v-else>Find Your Reseller</span>
              </v-btn
            >
            <v-btn
              depressed
              color="primary"
              block
              large
              v-show="resellerFound"
              @click="showConfirmationDialog"
              :loading="btnLoading"
              :disabled="btnLoading"
              >
                <span v-if="user.type === 'Reseller'">Confirm Your Referrer</span>
                <span v-else>Confirm Your Reseller</span>
              </v-btn
            >
            <div class="mt-4 text-xs-center">
              <v-btn flat type="button" color="primary" @click="goBack"
                >Cancel</v-btn
              >
            </div>
          </div>
        </v-form>
      </div>
    </v-container>
    <Dialog />
    <Modal ref="modal" />
  </div>
</template>



<script>
import { mixins } from "@/mixins";
import { mapGetters } from "vuex";
import Modal from "@/components/Modal";
import MaleDefaultImage from "@/assets/img/male-default.jpg";

export default {
  data: () => ({
    action: null,
    resellerValid: true,
    imgObj: {
      src: null,
      loading: require("../../static/img/spinner.gif"),
      error: require("../../static/img/default-profpic.png")
    },
    resellerSearch: null,
    resellerFound: false,
    resellerDetails: {},
    btnLoading: false
  }),
  components: { Modal },
  methods: {
    findReseller() {
      if (this.$refs.resellerForm.validate()) {
        this.Indicator().open();
        this.$store
          .dispatch("accounts/FIND_RESELLER", { data: this.resellerSearch.toLowerCase() })
          .then(res => {
            console.log(res);
            if (!res.empty) {
              this.Indicator().close();
              this.resellerFound = true;
              this.resellerDetails = Object.assign({}, res.data);
              this.imgObj.src =
                this.resellerDetails.downloadURL || MaleDefaultImage;
              console.log(this.imgObj);
            } else {
              this.Indicator().close();
              this.resellerFound = false;
              this.$events.$emit("SET_DIALOG", {
                status: true,
                title: "Sorry",
                message: "No reseller found."
              });
            }
          })
          .catch(e => {
            this.Indicator().close();
            this.$events.$emit("SET_DIALOG", {
              status: true,
              title: "Find Reseller Error",
              message: "An error occurred."
            });
            console.error(e);
          });
      }
    },
    showConfirmationDialog() {
      if(this.user.type === 'Reseller') {
         this.$refs.modal.show(
          "Warning!",
          "Are you sure you want to add this referral? This is unchangable once confirmed.",
          () => {
            this.confirmReseller();
          }
        );
      }
      else {
        this.confirmReseller();
      }
    },
    confirmReseller() {
      if(this.user.type === 'Reseller') {

        this.Indicator().open();
        this.$store.dispatch("accounts/ADD_REFERRED_BY_TO_RESELLER", {
          referredById: this.resellerDetails.uid,
          referrersEmail: this.resellerDetails.email,
          uid: this.user.uid,
        })
        .then(() => {
          this.Indicator().close();
          this.$refs.modal.show(
            "Success",
            "Your referral has been updated.",
            () => {
              this.$router.go(-1);
            }
          );
        })
        .catch(error => {
          console.log(error);
          this.Indicator().close();
          this.$refs.modal.show(
            "Error",
            "There was a problem adding your referral. Please try again.",
            () => {
              this.$router.go(-1);
            }
          );
        });
        return; 
      }

      //everything below is executed if user is not a reseller
      const payload = {
        customers: this.resellerDetails.customers,
        customerId: this.user.uid,
        resellerId: this.resellerDetails.uid,
        resellerData: this.resellerDetails
      };

      this.Indicator().open();

      this.$store
        .dispatch("accounts/ADD_CUSTOMER_TO_RESELLER", payload)
        .then(() => {
          this.Indicator().close();
          this.$refs.modal.show(
            "Success",
            "Your reseller has been updated.",
            () => {
              this.$router.go(-1);
            }
          );
        })
        .catch(e => {
          this.Indicator().close();
          this.$refs.modal.show(
            "Confirm reseller error",
            "Unexpected error occurred.",
            () => {
              this.$router.go(-1);
            }
          );
        });
    },
    goBack() {
      this.$router.go(-1);
    }
  },
  computed: {
    ...mapGetters({
      userReseller: "accounts/userReseller",
      user: "accounts/user"
    })
  },
  created() {
    this.action = this.$route.params.action === "add" ? "Add" : "Update";
    const userReseller = this.user.resellerData;
    if(!this.user.referredBy || this.user.referredBy === undefined) {
      this.imgObj.src = MaleDefaultImage;
    }

    if (userReseller !== undefined) {
      this.resellerDetails = userReseller;
      this.imgObj.src = userReseller.downloadURL || MaleDefaultImage;
      console.log(this.resellerDetails);
      console.log(this.imgObj);
    }
  },
  watch: {
    resellerSearch() {
      if (!this.resellerSearch) {
        this.resellerDetails = Object.assign(
          {},
          this.$store.getters["accounts/userReseller"]
        );
        this.resellerFound = false;
        this.imgObj.src = this.resellerDetails.downloadURL;
      }
    }
  },
  mixins: [mixins]
};
</script>

<style scoped>
.flipped {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
