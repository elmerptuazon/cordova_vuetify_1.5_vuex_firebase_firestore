<template>
  <div>
      <v-btn
        icon
        @click="goToContacts"
        v-if="user.type === 'Reseller'"
        v-show="isApproved"
      >
        <v-icon>people</v-icon>
      </v-btn>
  </div>
</template>

<script>
export default {
    data: () => ({

    }),

    methods: {
        goToContacts() {
            this.$router.push({ name: 'Contacts' });
        }   
    },

    computed: {
        user() {
            return this.$store.getters["accounts/user"];
        },

        isApproved() {
            return false;
            // return this.$store.getters["accounts/isApproved"];
        }
    }
}
</script>

<style>

</style>