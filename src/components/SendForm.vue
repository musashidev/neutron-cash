<template>
  <v-form ref="sendForm" v-model="sendFormValid" class="px-4">
    <v-row justify="center">
      <v-col cols="6">
        <v-text-field
          v-model="send.address"
          :rules="[addressValidationRule]"
          label="Address"
          placeholder="bitcoincash:"
          clearable
          @input="validateAddress"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model.number="send.amount"
          :rules="[amountValidationRule]"
          :suffix="amountIsFiat ? currency : 'BCH'"
          append-outer-icon="mdi-swap-vertical"
          label="Amount"
          maxlength="17"
          @keypress="onlyNumber($event)"
          @click:append-outer="amountIsFiat = !amountIsFiat"
        ></v-text-field>
        <span class="text--secondary">{{ displayConversion }}</span>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col class="text-center">
        <v-btn color="primary" text @click="sendClick">
          Send
          <v-icon right>mdi-send</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
const grpcClient = require("@/js/bchwallet-grpc.js");
const walletService = grpcClient.getWalletService();

export default {
  name: "SendForm",
  props: {
    balance: { type: Number, required: true },
    exchangeRate: { type: Number, required: true },
    currency: { type: String, required: true }
  },
  data: () => ({
    send: { amount: 0, address: "" },
    amountIsFiat: false,
    addressValid: false,
    sendFormValid: false
  }),
  computed: {
    amountToBCH() {
      return this.amountIsFiat
        ? this.send.amount / this.exchangeRate
        : parseFloat(this.send.amount);
    },
    displayConversion() {
      if (this.amountIsFiat) {
        return !isNaN(this.amountToBCH)
          ? this.amountToBCH.toFixed(8).concat(" BCH")
          : "0.00000000 BCH";
      } else {
        return !isNaN(this.send.amount)
          ? (this.send.amount * this.exchangeRate)
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
    addressValidationRule() {
      if (this.addressValid) {
        return true;
      } else {
        return "Invalid address";
      }
    },
    amountValidationRule() {
      if (this.amountToBCH > 0 && this.amountToBCH <= this.balance) {
        return true;
      } else {
        if (this.amountToBCH > this.balance) {
          return "Not enough funds";
        } else {
          return "";
        }
      }
    },
    validateAddress(address) {
      const that = this;
      try {
        let url = new URL(address);
        let amount = parseFloat(url.searchParams.get("amount"));
        if (amount) {
          that.send.amount = amount.toFixed(8);
          that.send.address = url.pathname;
          this.amountIsFiat = false;
        }
      } catch {
        //It's not an URI
      }
      walletService.ValidateAddress({ address: that.send.address }, function(
        err,
        response
      ) {
        if (err) {
          console.log(err);
        } else {
          that.addressValid = response.valid;
          that.$refs.sendForm.validate();
        }
      });
    },
    sendClick() {
      if (this.$refs.sendForm.validate()) {
        this.$emit("send", {
          amount: this.amountToBCH,
          address: this.send.address
        });
      }
    }
  }
};
</script>
