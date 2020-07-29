<template>
  <v-dialog v-model="active" max-width="600" @click:outside="closeDialog">
    <v-card>
      <v-card-title class="text--secondary">Transaction details</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Amount</v-list-item-title>
              <v-list-item-subtitle
                >{{
                  (transactionValue * 1e-8).toFixed(8)
                }}
                BCH</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item v-if="transactionValue < 0">
            <v-list-item-content>
              <v-list-item-title>Fee</v-list-item-title>
              <v-list-item-subtitle
                >-{{
                  (transaction.fee * 1e-8).toFixed(8)
                }}
                BCH</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-divider v-if="transactionValue < 0" />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Confirmations</v-list-item-title>
              <v-list-item-subtitle>{{ confirmations }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title>TxID</v-list-item-title>
              <v-list-item-subtitle>{{ txID }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Date</v-list-item-title>
              <v-list-item-subtitle>{{ transactionDate }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "TransactionInfoDialog",
  props: {
    active: { type: Boolean, required: true },
    transaction: { type: Object, required: true },
    txBlockHeight: { type: Number, required: true },
    networkBlockHeight: { type: Number, required: true }
  },
  data: () => ({}),
  computed: {
    transactionValue() {
      let value = 0;
      this.transaction.credits.forEach(credit => {
        value += credit.amount;
      });
      this.transaction.debits.forEach(debit => {
        value -= debit.previous_amount;
      });
      return value;
    },
    confirmations() {
      return this.txBlockHeight
        ? this.networkBlockHeight - this.txBlockHeight + 1
        : 0;
    },
    txID() {
      return this.transaction.hash
        .slice()
        .reverse()
        .toString("hex");
    },
    transactionDate() {
      return new Date(this.transaction.timestamp * 1000).toLocaleString();
    }
  },
  methods: {
    closeDialog() {
      this.$emit("closeDialog");
    }
  }
};
</script>
