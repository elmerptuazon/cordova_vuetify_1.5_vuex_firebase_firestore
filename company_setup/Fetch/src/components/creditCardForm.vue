<template>
  <v-container>
    <v-layout align-center justify-center row fill-height>
      <v-flex xs12>
        <p class="body-2">Credit Card Number:</p>
        <v-text-field
          single-line
          outline
          v-cardformat:formatCardNumber
          v-model="cardDetails.cardNumber"
          prepend-icon="credit_card"
        >
        </v-text-field>
      </v-flex>
    </v-layout>
    <v-layout align-center justify-center row fill-height>
      <v-flex xs7>
        <p class="body-2">Expiry:</p>
        <v-text-field
          single-line
          outline
          v-cardformat:formatCardExpiry
          v-model="cardDetails.expiry"
          placeholder="MM / YYYY"
        >
        </v-text-field>
      </v-flex>
      <v-flex xs5 ml-1>
        <p class="body-2">CVC:</p>
        <v-text-field
          single-line
          outline
          v-cardformat:formatCardCVC
          v-model="cardDetails.CVC"
        >
        </v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    cardDetails: {
      cardNumber: null,
      expiry: null,
      CVC: null
    }
  }),
  mounted() {},
  methods: {},
  watch: {
    cardDetails: {
      handler(values) {
        this.$emit("cardDetails", values);
      },
      deep: true
    }
  }
};
</script>

<style scoped>
</style>