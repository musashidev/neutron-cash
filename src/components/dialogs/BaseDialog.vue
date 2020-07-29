<template>
  <v-dialog
    v-model="active"
    :persistent="persistent"
    max-width="400"
    @click:outside="clickOutside"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ text }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="closeable" color="primary" text @click="closeDialog"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "BaseDialog",
  props: {
    active: { type: Boolean, required: true },
    title: { type: String, required: false, default: "" },
    text: { type: String, required: false, default: "" },
    persistent: { type: Boolean, required: false, default: false },
    closeable: { type: Boolean, required: false, default: true }
  },
  data: () => ({}),
  methods: {
    closeDialog() {
      this.$emit("closeDialog");
    },
    clickOutside() {
      if (!this.persistent) {
        this.$emit("closeDialog");
      }
    }
  }
};
</script>
