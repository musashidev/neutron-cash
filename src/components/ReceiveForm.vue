<template>
  <v-row justify="center">
    <v-col cols="6">
      <v-text-field
        v-model.number="amount"
        :suffix="amountIsFiat ? currency : 'BCH'"
        append-outer-icon="mdi-swap-vertical"
        maxlength="17"
        label="Requested amount"
        @keypress="onlyNumber($event)"
        @click:append-outer="outerClick"
        @input="receiveInput"
      ></v-text-field>
      <span class="text--secondary">{{ displayConversion }}</span>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "ReceiveForm",
  props: {
    exchangeRate: { type: Number, required: true },
    currency: { type: String, required: true }
  },
  data: () => ({
    amount: 0,
    amountIsFiat: false
  }),
  computed: {
    amountToBCH() {
      return this.amountIsFiat
        ? this.amount / this.exchangeRate
        : parseFloat(this.amount);
    },
    displayConversion() {
      if (this.amountIsFiat) {
        return !isNaN(this.amountToBCH)
          ? this.amountToBCH.toFixed(8).concat(" BCH")
          : "0.00000000 BCH";
      } else {
        return !isNaN(this.amount)
          ? (this.amount * this.exchangeRate)
              .toFixed(2)
              .concat(" ", this.currency)
          : "0.00".concat(" ", this.currency);
      }
    }
  },
  methods: {
    onlyNumber(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      //Allow only numbers and "."
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
    },
    outerClick() {
      this.amountIsFiat = !this.amountIsFiat;
      this.receiveInput();
    },
    receiveInput() {
      this.$emit("input", this.amountToBCH);
    }
  }
};
</script>
