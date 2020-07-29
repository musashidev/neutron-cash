<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <div
        class="d-flex flex-column align-center justify-center"
        v-on="on"
        @click="clicked"
      >
        <v-card class="pt-2 px-2" color="white" flat>
          <QrcodeVue :value="paymentURL" size="140" level="M"></QrcodeVue>
        </v-card>
        <span class="font-weight-light caption">{{ address }}</span>
      </div>
    </template>
    <span id="tooltip">Click to copy</span>
  </v-tooltip>
</template>

<script>
import QrcodeVue from "qrcode.vue";

export default {
  name: "Receive",

  components: {
    QrcodeVue
  },
  props: {
    amount: { type: Number, required: true },
    address: { type: String, required: true }
  },
  data: () => ({}),
  computed: {
    paymentURL: function() {
      let paymentURL = "bitcoincash:".concat(this.address);
      if (!isNaN(this.amount)) {
        paymentURL = paymentURL.concat("?amount=", this.amount.toFixed(8));
      }
      return paymentURL;
    }
  },
  methods: {
    clicked() {
      navigator.clipboard
        .writeText(this.paymentURL)
        .then((document.getElementById("tooltip").innerText = "Copied!"));
    }
  }
};
</script>
