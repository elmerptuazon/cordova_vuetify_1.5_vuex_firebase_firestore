<template>
    <v-app>
      <v-toolbar app color="white" class="grey--text text--darken-1" v-if="GET_SHOW_TOOLBAR">
        <v-toolbar-title class="mx-auto">{{GET_TOOLBAR_TITLE}}</v-toolbar-title>
      </v-toolbar>
      <v-content>
          <router-view></router-view>
      </v-content>
    </v-app>
  </template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name: 'register-success',
    computed: {
      ...mapGetters([
        'GET_TOOLBAR_TITLE',
        'GET_SHOW_TOOLBAR'
      ])
    }
  }

</script>
