<template>
  <v-dialog v-model="active" persistent max-width="400">
    <v-card>
      <v-card-title>Confirm transaction</v-card-title>
      <v-card-text>
        <span>
          BCH: <b>{{ amount.toFixed(8) }}</b>
          <br />
        </span>
        <span>
          {{ currency }}:
          <b>{{ (amount * exchangeRate).toFixed(2) }}</b>
          <br />
        </span>
        <span>
          To:
          <b>{{ address }}</b>
        </span>

        <v-text-field
          v-model="passphrase"
          label="Password"
          type="password"
          required
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" text @click="confirm">Send</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmTransactionDialog",
  props: {
    active: { type: Boolean, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    address: { type: String, required: true }
  },
  data: () => ({
    passphrase: ""
  }),
  methods: {
    closeDialog() {
      this.$emit("closeDialog");
      this.passphrase = "";
    },
    confirm() {
      this.$emit("confirm", this.passphrase);
      this.$emit("closeDialog");
      this.passphrase = "";
    }
  }
};
</script>
