<template>
  <v-app>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
  import {
    mixins
  } from '@/mixins'
  export default {
    name: 'tabs',
    methods: {
      extendToolbar () {
        this.$store.commit('SET_EXTENDED_TOOLBAR')
      }
    },
    mixins: [mixins]
  }

</script>

