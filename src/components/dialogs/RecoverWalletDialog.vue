<template>
  <v-dialog v-model="active" persistent max-width="400">
    <v-card>
      <v-card-title>Recover wallet</v-card-title>
      <v-card-text>
        <span>Enter the recovery seed.</span>
        <v-form ref="seedForm">
          <v-row v-for="n in 6" :key="n" class="my-n4">
            <v-col cols="6">
              <v-text-field
                v-model="words[n * 2 - 2]"
                :rules="rules"
                :label="'Word '.concat(n * 2 - 1).toString()"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="words[n * 2 - 1]"
                :rules="rules"
                :label="'Word '.concat(n * 2).toString()"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>
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
  name: "RecoverWalletDialog",
  props: {
    active: { type: Boolean, required: true }
  },
  data: () => ({
    words: new Array(12).fill(""),
    rules: [
      value => !!value || "Word can't be left blank",
      value => !/[^a-z]/i.test(value) || "Invalid character"
    ]
  }),
  computed: {
    mnemonicSeed() {
      return this.words.join(" ").toLowerCase();
    }
  },
  methods: {
    confirm() {
      if (this.$refs.seedForm.validate()) {
        this.$emit("confirm", this.mnemonicSeed);
        this.closeDialog();
      }
    },
    closeDialog() {
      this.$emit("closeDialog");
      this.words = new Array(12).fill("");
    }
  }
};
</script>
