<template>
  <v-dialog v-model="active" persistent max-width="400">
    <v-card>
      <v-card-title>Change currency</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-select
              v-model="currency"
              :items="currencies"
              label="Currency"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="provider"
              :items="providers"
              label="Provider"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" text @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { getProviders, getCurrencies } from "@/js/exchange-rates.js";

export default {
  name: "ChangeCurrencyDialog",
  props: {
    currentCurrency: { type: String, required: true },
    active: { type: Boolean, required: true }
  },
  data: () => ({
    currency: "USD",
    provider: "BitPay",
    currencies: [],
    providers: []
  }),
  watch: {
    currentCurrency(newVal) {
      this.currency = newVal;
    }
  },
  mounted() {
    this.providers = getProviders();
    getCurrencies(this.provider).then(response => (this.currencies = response));
  },
  methods: {
    confirm() {
      this.$emit("confirm", this.currency);
      this.$emit("closeDialog");
    },
    closeDialog() {
      this.$emit("closeDialog");
      this.currency = this.currentCurrency;
    }
  }
};
</script>
