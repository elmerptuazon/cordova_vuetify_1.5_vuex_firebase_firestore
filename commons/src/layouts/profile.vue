<template>
    <v-app>
      <v-content>
        <v-container id="scroll-target" style="max-height: 85vh;" class="scroll-y">
          <router-view></router-view>
        </v-container>
      </v-content>
    </v-app>
  </template>

  <script>
  export default {
      name: 'profile'
    }
  </script>

