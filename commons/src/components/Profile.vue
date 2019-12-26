<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="backToMain">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">Profile</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="editProfile">
        <v-icon>border_color</v-icon>
      </v-btn>
    </v-toolbar>
    <v-container fluid grid-list-lg>
      <ProfileHeader :hasViewProfile="false" :hasRating="false" />
      <div :class="[user.type === 'Customer' ? 'mt-3' : 'mt-4']">
        <v-layout row wrap>
            <v-flex xs4>
                <p class="grey--text header-text" v-if="user.type === 'Reseller'">Reseller ID</p>
              </v-flex>
              <v-flex xs8>
                <p class="body-1 header-text grey--text text--darken-2">{{user.agentId}}</p>
              </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Name</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2">{{user.firstName}} {{user.middleInitial}} {{user.lastName}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Birthday</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2">{{user.birthday | birthdayFormat}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Gender</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2">{{user.gender}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Email</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2">{{user.email}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Contact</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2">{{user.contact}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">House</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2" v-if="user.address && user.address.house">{{user.address.house}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Street name</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2" v-if="user.address && user.address.streetName">{{user.address.streetName}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">Province</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2" v-if="user.address && user.address.province">{{user.address.province}}</p>
          </v-flex>
          <v-flex xs4>
            <p class="grey--text header-text">City/Municipality</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2" v-if="user.address && user.address.citymun">{{user.address.citymun}}</p>
          </v-flex>
           <v-flex xs4>
            <p class="grey--text header-text">Zip Code</p>
          </v-flex>
          <v-flex xs8>
            <p class="body-1 header-text grey--text text--darken-2" v-if="user.address && user.address.zipCode">{{user.address.zipCode}}</p>
          </v-flex>
        </v-layout>
        <!-- <v-divider></v-divider> -->
      </div>
    </v-container>
  </div>
</template>

<script>
  import {
    mapGetters
  } from 'vuex'
  import moment from 'moment'
  import ProfileHeader from '@/components/ProfileHeader'
  export default {
    components: {
      ProfileHeader
    },
    computed: {
      ...mapGetters('accounts', [
        'user'
      ])
    },
    methods: {
      backToMain() {
        this.$events.$emit('SET_CURRENT_TAB', 'more')
      },
      editProfile () {
        //this.$events.$emit('SET_CURRENT_TAB', 'editProfilePage')
        this.$router.push({name: 'EditProfile'})
      }
    },
    filters: {
      birthdayFormat (val) {
        return moment(val).format('MMMM DD, YYYY')
      }
    }
  }

</script>

<style scoped>
  .header-text {
    font-size: 11px;
  }
</style>

