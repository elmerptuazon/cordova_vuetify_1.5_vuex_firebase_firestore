<template>
  <v-app class="primary">
    <v-content>
        <router-view></router-view>
    </v-content>
    <v-footer app class="pa-3 transparent">
      <div class="text-xs-center mx-auto white--text">POWERED BY APPSELL</div>
    </v-footer>
  </v-app>
</template>

<script>
export default {
    name: 'default',
    beforeCreate () {
      // this.$store.dispatch('accounts/AUTH_STATE_OBSERVER')
    }
}
</script>
