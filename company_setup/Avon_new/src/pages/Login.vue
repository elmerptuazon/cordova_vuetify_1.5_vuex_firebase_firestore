<template>
  <v-container fluid>
    <div class="text-xs-center" style="margin:0 auto; width:250px;">
      <v-img :src="require('@/assets/img/header_logo.jpg')" contain></v-img>
    </div>
    <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
      <v-layout column style="margin-top: 6%;">
        <v-flex xs12>
          <v-text-field
            dark
            color="white"
            required
            label="Email address"
            v-model="email"
            type="email"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-text-field
            dark
            color="white"
            required
            label="Password"
            :type="e1 ? 'password' : 'text'"
            :append-icon="e1 ? 'visibility_off' : 'visibility'"
            @click:append="() => (e1 = !e1)"
            v-model="password"
          ></v-text-field>
        </v-flex>

        <div class="px-4">
          <v-btn
            depressed
            class="white primary--text"
            block
            large
            type="submit"
            :loading="loginBtnLoading"
            :disabled="loginBtnLoading"
            >Login</v-btn
          >
        </div>

        <v-flex xs12 class="mt-1">
          <p
            class="subheading text-xs-center white--text"
            @click="forgotPassword"
          >
            Forgot Password
          </p>
        </v-flex>
      </v-layout>
    </v-form>
    <Dialog />
  </v-container>
</template>

<script>
import { mixins } from "@/mixins";
import Modal from "@/components/Modal";

export default {
  data: () => ({
    email: "", //'ben.appsell@gmail.com',
    password: "", //'testreseller',
    valid: true,
    e1: true,
    loginBtnLoading: false
  }),
  mounted() {},
  methods: {
    submit() {
      // this.$refs.form.validate()

      if (this.email && this.password) {
        this.email = this.email.toLowerCase();
        
        this.loginBtnLoading = true;

        this.$store
          .dispatch("accounts/LOGIN", {
            email: this.email,
            password: this.password
          })
          .then(user => {
            this.loginBtnLoading = false;

            if (user.type === "Reseller" && user.status === "pending") {
              this.$router.push({ name: "More" });
            } else if (user.type === "Reseller" && user.status === "denied") {
              this.$router.push({ name: "More" });
            } else {
              this.$router.push({ name: "Catalogue" });
            }
          })
          .catch(error => {
            this.loginBtnLoading = false;
            console.log(error);
            const message = () => {
              let errMessage = "";
              if (
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
              ) {
                errMessage = "The email address or password is incorrect.";
              } else if (error.code === "auth/email-not-verified") {
                errMessage = "The email address is not yet verified.";
              } else if (error.code === "storage/object-not-found") {
                this.$router.push({ name: "Catalogue" });
              } else {
                errMessage = error.message;
              }
              return errMessage;
            };

            this.$events.$emit("SET_DIALOG", {
              status: true,
              title: "Sorry",
              message: message()
            });

            console.error(error);
          });
      } else if (this.email === "" && this.password == "") {
        this.$events.$emit("SET_DIALOG", {
          status: true,
          title: "Sorry",
          message:
            "Email/Contact Number and Password is required! Please try again."
        });
      } else if (this.email === "") {
        this.$events.$emit("SET_DIALOG", {
          status: true,
          title: "Sorry",
          message: "Email or Contact Number is required! Please try again."
        });
      } else if (this.password === "") {
        this.$events.$emit("SET_DIALOG", {
          status: true,
          title: "Sorry",
          message: "Password is required! Please try again."
        });
      }
    },
    forgotPassword() {
      this.$store.commit("SET_TOOLBAR_TITLE", "Forgot Password");
      this.$router.push({ name: "ForgotPassword" });
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
</style>

