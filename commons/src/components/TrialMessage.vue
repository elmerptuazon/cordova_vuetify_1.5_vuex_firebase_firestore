<template>
  <v-dialog v-model="dialog" persistent>
    <v-card>
      <v-card-title primary-title>
        <div class="title">Welcome!</div>
      </v-card-title>
      <v-card-text>
        <p class="text-xs-justify">
          Welcome to the EB RESELLER APP! We are excited to onboard
          <strong>new</strong> resellers within
          <strong>Metro Manila</strong> who want a better income and a more
          beautiful life
        </p>

        <p class="text-xs-justify">
          If you are what we are looking for, REGISTER NOW!
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn block color="primary" @click="dialog = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false
  }),
  methods: {
    show() {
      this.dialog = true;
    }
  }
};
</script>
