<template>
  <div>
    <v-btn icon flat color="white" @click="goTo('More')">
      <v-icon>account_circle</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  methods: {
    goTo(page) {
      this.$router.push({ name: page });
    }
  }
};
</script>

<style scoped>
</style>
