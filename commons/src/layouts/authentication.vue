<template>
  <v-app class="primary">
    <v-toolbar app color="white" class="grey--text text--darken-1">
      <v-btn icon @click="backToHome">
        <v-icon color="grey darken-1">arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title>{{GET_TOOLBAR_TITLE}}</v-toolbar-title>
    </v-toolbar>
    <v-content>
          <router-view></router-view>
    </v-content>
  </v-app>
</template>


<script>
import { mapGetters } from 'vuex'
  export default {
    name: 'authentication',
    data () {
      return {}
    },
    methods: {
      backToHome () {
        if(this.GET_TOOLBAR_TITLE === 'Forgot Password') {
          this.$router.go(-2)
        } else {
          this.$router.go(-1)
        }
      }
    },
    computed: {
      ...mapGetters([
        'GET_TOOLBAR_TITLE'
      ])
    },
  }

</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .25s;
}

.fade-enter-active {
  transition-delay: .25s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>

