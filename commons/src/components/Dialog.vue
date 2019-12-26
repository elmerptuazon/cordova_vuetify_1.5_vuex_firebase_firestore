<template>
  <v-dialog v-model="dialog" persistent>
      <v-card>
        <v-card-title class="headline pb-1">{{title}}</v-card-title>
        <v-card-text>
            {{message}}
        </v-card-text>
        <v-card-actions>
          <!-- <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">Disagree</v-btn> -->
          <v-btn block color="primary" dark depressed @click.native="dialog = false">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
  data: () => ({
      dialog: false,
      title: null,
      message: null
  }),
  created () {
    this.$events.$on('SET_DIALOG', eventData => {
        this.dialog = eventData.status
        this.title = eventData.title
        this.message = eventData.message
        if (eventData.callback) {
          setTimeout(() => {
            this.dialog = false
            eventData.callback()
          }, 2000)
        }
    })
  }
}
</script>
