<template>
  <v-layout row wrap>
    <v-flex xs3
      v-if="displayProfilePicture"
    >
      <v-img
        :src="user.downloadURL"
        class="mt-2 elevation-1"
        v-if="user.downloadURL"
      >
        <v-layout
          slot="placeholder"
          fill-height
          align-center
          justify-center
          ma-0
        >
          <v-progress-circular
            indeterminate
            color="grey lighten-5"
          ></v-progress-circular>
        </v-layout>
      </v-img>
      <v-img v-else :src="user.imageObj.src"></v-img>
    </v-flex>
    <v-flex xs9>
      <!-- <div class="headline mb-1">
        {{ user.firstName }} {{ user.middleInitial }} {{ user.lastName }}
      </div> -->
      <div class="headline mb-1">
        {{ user.branchName || 'Your Branch Name'}}
      </div>
      <div v-if="user.type === 'Reseller'">
        <div class="grey--text" v-if="$store.getters['accounts/isApproved']">
          Member since {{ user.createdAt | memberSince }}
        </div>
        <div class="grey--text" v-if="$store.getters['accounts/isApproved']">
          Branch ID Number: {{ user.agentId }}
        </div>
      </div>
      <div v-if="hasViewProfile">
        <a style="text-decoration: none;" @click="viewProfile">View Profile</a>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import moment from "moment";
import defaultBranchPic from '@/assets/img/DefaultBranchPic.png';

export default {
  props: {
    hasViewProfile: {
      default: true
    },
    displayProfilePicture: {
      default: true
    }
  },
  data: () => ({
    profileImage: {
      width: null,
      height: null
    },
    sizeLoaded: false
  }),
  methods: {
    viewProfile() {
      this.$router.push({ name: "Profile" });
    }
  },
  created() {
    if(!this.user.downloadURL) {
      this.user.imageObj.src = defaultBranchPic;
    }

    this.createFakeImage(this.user.imageObj.src).then(data => {
      this.profileImage = {
        height: data.height + "px",
        width: data.width + "px"
      };
      this.sizeLoaded = true;
    });

    console.log(this.user.imageObj);
  },
  computed: {
    ...mapGetters("accounts", ["user"]),
    hasRating() {
      return this.user.type === "Customer" ? true : false;
    }
  },
  filters: {
    memberSince(val) {
      return moment(val).format("MMMM D YYYY");
    }
  },
  mixins: [mixins]
};
</script>

<style scoped>
/* .flipped {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
} */
</style>
