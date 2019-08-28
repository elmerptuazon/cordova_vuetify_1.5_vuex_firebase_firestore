<template>
  <v-container fluid>
    <v-layout column>
      <div class="text-xs-center" style="margin-top: 40%; margin-bottom: 2%;">
        <mt-spinner
          type="triple-bounce"
          color="#1976D2"
          :size="60"
          v-show="!showLogo"
        ></mt-spinner>
        <transition name="fade">
          <div class="mb-3" style="margin:0 auto; width:250px;">
            <v-img
              :src="require('@/assets/img/header_logo.jpg')"
              contain
            ></v-img>
          </div>
        </transition>
      </div>
      <div class="px-4">
        <v-btn
          depressed
          color="white primary--text"
          block
          large
          class="mt-3"
          @click="login"
          ><v-icon left>email</v-icon>
          <div>Login with Email</div>
        </v-btn>
        <v-btn
          depressed
          color="white primary--text"
          block
          large
          class="mt-3"
          @click="login"
        >
          <v-icon left>phone</v-icon>
          Login with Phone Number
        </v-btn>

        <v-btn
          depressed
          color="white primary--text"
          block
          large
          class="mt-3"
          @click="register"
          >Not Yet Registered?</v-btn
        >
      </div>
    </v-layout>
    <TrialMessage ref="trial" />
  </v-container>
</template>

<script>
import { Spinner } from "mint-ui";
import { mixins } from "@/mixins";
import TrialMessage from "@/components/TrialMessage";

export default {
  mixins: [mixins],
  data: () => ({
    showLogo: false
  }),
  mounted() {
    setTimeout(() => {
      this.showLogo = true;
    }, 10);
    //this.$refs.trial.show();
  },
  methods: {
    login(userType) {
      this.$store.commit("SET_TOOLBAR_TITLE", "Login with Email");
      this.$router.push({ name: "Login" });
    },
    register() {
      this.$store.commit("SET_TOOLBAR_TITLE", "Sign Up");
      this.$router.push({ name: "Register" });
    }
  },
  components: {
    "mt-spinner": Spinner,
    TrialMessage
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

