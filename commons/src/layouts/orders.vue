<template>
  <v-app>
    <v-content>
      <v-container id="scroll-target" style="max-height: 100vh;" class="scroll-y" fluid>
      <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    name: 'orders'
  }

</script>
