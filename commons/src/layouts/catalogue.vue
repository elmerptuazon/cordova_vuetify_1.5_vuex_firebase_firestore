<template>
  <v-app>
    <v-content>
      <v-container id="scroll-target" style="max-height: 100vh;" class="scroll-y" fluid>
        <v-layout
          column
          style="height: 100vh;"
        >
      <!-- <router-view v-transition></router-view> -->
      <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'catalogue'
}
</script>
