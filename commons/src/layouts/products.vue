<template>
  <v-app>
    <v-content>
      <v-container id="scroll-target" style="max-height: 85vh;" class="scroll-y" fluid>
        <v-layout
          column
          style="height: 85vh;"
        >
      <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    name: 'products',
    methods: {}
  }

</script>
