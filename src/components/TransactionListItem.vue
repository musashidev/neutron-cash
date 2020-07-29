<template>
  <v-list-item @click="dialog = true">
    <v-list-item-icon>
      <v-icon v-if="transactionValue < 0" color="red lighten-1"
        >mdi-arrow-top-right</v-icon
      >
      <v-icon v-else color="green lighten-1">mdi-arrow-bottom-left</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>{{ transactionValue }} BCH</v-list-item-title>
      <v-list-item-subtitle>{{
        new Date(transaction.timestamp * 1000).toLocaleDateString()
      }}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-content class="text-right ml-n16">
      <v-list-item-subtitle
        >{{ (transactionValue * exchangeRate).toFixed(2) }}
        {{ fiatCurrency }}</v-list-item-subtitle
      >
    </v-list-item-content>
    <TransactionInfoDialog
      :active="dialog"
      :transaction="transaction"
      :tx-block-height="txBlockHeight"
      :network-block-height="networkBlockHeight"
      @closeDialog="dialog = false"
    />
  </v-list-item>
</template>
<script>
import TransactionInfoDialog from "@/components/dialogs/TransactionInfoDialog.vue";

export default {
  name: "TransactionListItem",
  components: {
    TransactionInfoDialog
  },
  props: {
    transaction: { type: Object, required: true },
    txBlockHeight: { type: Number, required: false, default: 0 },
    networkBlockHeight: { type: Number, required: false, default: 0 },
    exchangeRate: { type: Number, required: true },
    fiatCurrency: { type: String, required: true }
  },
  data: () => ({
    dialog: false
  }),
  computed: {
    transactionValue() {
      let value = 0;
      this.transaction.credits.forEach(credit => {
        value += credit.amount;
      });
      this.transaction.debits.forEach(debit => {
        value -= debit.previous_amount;
      });
      return (value * 1e-8).toFixed(8);
    }
  }
};
</script>
