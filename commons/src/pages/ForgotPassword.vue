<template>
  <v-container fluid>
    <div class="text-xs-center mt-5">
      <v-img :src="require('@/assets/img/header_logo.jpg')" contain></v-img>
    </div>
    <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
      <v-layout column class="mt-4">
        <v-flex xs12>
          <v-text-field 
            dark
            color="white"
            clearable 
            required 
            :rules="basicRules" 
            label="Email address" 
            v-model="email"
            type="email"
          ></v-text-field>
        </v-flex>
        <div class="px-4">
          <v-btn 
            depressed 
            color="primary" 
            block 
            large
            type="submit">Send Reset Password Link</v-btn>
        </div>
      </v-layout>
    </v-form>
    <Dialog />
  </v-container>
</template>

<script>
  import {
    mixins
  } from '@/mixins'
  export default {
      data: () => ({
          valid: true,
          email: null
      }),
      methods: {
        submit() {
          this.email = this.email.toLowerCase();
          
          if(this.$refs.form.validate()) {
            this.Indicator().open()
            this.$store.dispatch('accounts/RESET_PASSWORD', this.email)
            .then(() => {
              this.Indicator().close()
              this.email = null
              this.$events.$emit('SET_DIALOG', {status: true, title: 'Email sent', message:'Reset password link has been sent to your email.'})
            })
            .catch((error) => {
              this.Indicator().close()
              this.email = null;
              let errmessage = "The email does not exist, or the email has been typed incorrectly. Please try again.";
              this.$events.$emit('SET_DIALOG', {status: true, title: 'Sorry', message: errmessage})
              console.error(error)
            })
          }
        }
      },
    mixins: [mixins]
  }
</script>

<style scoped>
.input-group.input-group--error label {
  animation: none !important;
}
</style>
