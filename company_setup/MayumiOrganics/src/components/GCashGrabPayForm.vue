<template>
  <v-container fluid class="pa-1">
      <v-layout align-center justify-center row wrap>
        <v-flex xs12 class="caption red--text lighten-1 font-italic">
          <span class="font-weight-bold">NOTE:</span>
          Please enter the required details, same as what you are using in your {{ paymentType }} account.
        </v-flex>
        <v-flex xs12 class="mt-1">
          <v-checkbox
            v-model="accountDetails.sameAsUserDetails"
            label="Use my account's name, email, and phone."
          ></v-checkbox>
        </v-flex>
      </v-layout>
      <v-layout align-center justify-center row wrap>
        <v-flex xs12>
          <p class="body-2">Fullname:</p>
          <v-text-field
            v-model="accountDetails.name"
            single-line
            outline prepend-inner-icon="account_circle"
            :disabled="accountDetails.sameAsUserDetails"
            clearable
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <p class="body-2">Email:</p>
          <v-text-field
            v-model="accountDetails.email"
            single-line outline
            type="email" :rules="emailRules"
            prepend-inner-icon="email"
            :disabled="accountDetails.sameAsUserDetails"
            clearable
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <p class="body-2">Phone Number:</p>
          <v-text-field
            v-model="accountDetails.phone"
            single-line outline
            :rules="mobileRules" type="number"
            prepend-inner-icon="phone"
            :disabled="accountDetails.sameAsUserDetails"
            clearable
          ></v-text-field>
        </v-flex>
      </v-layout>
  </v-container>
</template>

<script>
import { mixins } from "@/mixins";

export default {
    mixins: [mixins],
    props: ['paymentType'],
    mounted() {},

    data: () => ({
        accountDetails: {
            name: null,
            email: null,
            phone: null,
            sameAsUserDetails: false,
        }
    }),

    methods: {},
    watch: {
        accountDetails: {
            handler(values) {
                if(values.sameAsUserDetails) {
                    values.name = `${this.user.firstName} ${this.user.middleInitial} ${this.user.lastName}`;
                    values.email = this.user.email;
                    values.phone = this.user.contact;
                }
                this.$emit("accountDetails", {
                    name: values.name,
                    email: values.email,
                    phone: values.phone
                });
            },
            deep: true
        }
    },

    computed: {
        user() {
            return this.$store.getters["accounts/user"];
        }
    }
}
</script>

<style>

</style>
