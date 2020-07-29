<template>
  <v-list max-height="225" style="overflow-y: auto">
    <div v-for="(transaction, index) in unminedTransactions" :key="index">
      <TransactionListItem
        :transaction="transaction"
        :exchange-rate="exchangeRate"
        :fiat-currency="fiatCurrency"
      />
      <v-divider inset />
    </div>
    <div v-if="transactions.mined_transactions">
      <div
        v-for="block in transactions.mined_transactions.slice().reverse()"
        :key="block.height"
      >
        <div
          v-for="(transaction, index) in block.transactions.slice().reverse()"
          :key="index"
        >
          <TransactionListItem
            :transaction="transaction"
            :tx-block-height="block.height"
            :network-block-height="networkBlockHeight"
            :exchange-rate="exchangeRate"
            :fiat-currency="fiatCurrency"
          />
          <v-divider inset />
        </div>
      </div>
    </div>
  </v-list>
</template>

<script>
import TransactionListItem from "@/components/TransactionListItem.vue";

export default {
  name: "TransactionList",
  components: {
    TransactionListItem
  },
  props: {
    transactions: { type: Object, required: true },
    networkBlockHeight: { type: Number, required: true },
    exchangeRate: { type: Number, required: true },
    fiatCurrency: { type: String, required: true }
  },
  data: () => ({}),
  computed: {
    unminedTransactions() {
      let unminedTransactions = this.transactions.unmined_transactions;
      if (unminedTransactions) {
        return unminedTransactions.sort(function(a, b) {
          return b.timestamp - a.timestamp;
        });
      }
      return [];
    }
  }
};
</script>
