<template>
  <v-dialog v-model="active" persistent max-width="400">
    <v-card>
      <v-card-title>Change network fee</v-card-title>
      <v-card-text>
        <v-slider
          v-model="slider"
          :value="currentFee"
          class="align-center"
          :max="10"
          :min="1"
          persistent-hint
        ></v-slider>
        <span>{{ slider }} sat/byte</span>
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
export default {
  name: "ChangeFeeDialog",
  props: {
    currentFee: { type: Number, required: true },
    active: { type: Boolean, required: true }
  },
  data: () => ({
    slider: 1
  }),
  watch: {
    currentFee(newVal) {
      this.slider = newVal;
    }
  },
  methods: {
    confirm() {
      this.$emit("confirm", this.slider);
      this.$emit("closeDialog");
    },
    closeDialog() {
      this.$emit("closeDialog");
      this.slider = this.currentFee;
    }
  }
};
</script>
