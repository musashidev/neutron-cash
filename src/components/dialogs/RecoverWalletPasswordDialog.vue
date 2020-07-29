<template>
  <v-dialog v-model="active" persistent max-width="400">
    <v-card>
      <v-card-title>Recover wallet</v-card-title>
      <v-card-text>
        <v-form ref="passwordForm">
          <v-text-field
            v-model="password"
            :rules="rules"
            class="mx-6"
            type="password"
            label="Password"
            counter
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            :rules="[passwordConfirmationRule]"
            class="mx-6"
            type="password"
            label="Confirm password"
            counter
          ></v-text-field>
          <span class="text--secondary"
            >This password will be required before sending BCH.</span
          >
        </v-form>
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
  name: "RecoverWalletPasswordDialog",
  props: {
    active: { type: Boolean, required: true }
  },
  data: () => ({
    password: "",
    confirmPassword: "",
    rules: [
      value => !!value || "Password can't be left blank",
      value => value.length >= 12 || "Min 12 char."
    ]
  }),
  computed: {
    passwordConfirmationRule() {
      return () =>
        this.password === this.confirmPassword || "Passwords don't match";
    }
  },
  methods: {
    confirm() {
      if (this.$refs.passwordForm.validate()) {
        this.$emit("confirm", this.password);
        this.closeDialog();
      }
    },
    closeDialog() {
      this.$emit("closeDialog");
      this.password = "";
      this.confirmPassword = "";
    }
  }
};
</script>
