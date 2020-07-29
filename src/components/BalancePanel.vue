<template>
  <div class="d-flex flex-column align-center justify-center">
    <span class="title">{{ balance.toFixed(8) }} BCH</span>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <span class="subtitle" v-on="on">{{ fiatBalance }} {{ currency }}</span>
      </template>
      <span>1 BCH = {{ exchangeRate }} {{ currency }}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "BalancePanel",
  props: {
    balance: { type: Number, required: true },
    exchangeRate: { type: Number, required: true },
    currency: { type: String, required: true }
  },
  data: () => ({}),
  computed: {
    fiatBalance: function() {
      return (this.balance * this.exchangeRate).toFixed(2);
    }
  }
};
</script>
