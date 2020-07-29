<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-card v-if="!loading" class="mx-auto" max-width="500">
      <v-card-title class="justify-space-between">
        <span class="title">{{ steps[step - 1] }}</span>
        <span class>{{ step }}/{{ steps.length }}</span>
      </v-card-title>
      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card-text>
            <span class="text--secondary">
              This form will guide you through the creation of a new wallet.
            </span>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="2">
          <v-card-text>
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
          </v-card-text>
        </v-window-item>
        <v-window-item :value="3">
          <v-card-text>
            <v-textarea
              v-model="mnemonicSeed"
              label="Seed"
              auto-grow
              readonly
              rows="2"
            ></v-textarea>
            <span class="text--secondary">
              This is your wallet seed, write it down and keep it secret. You
              can use it to recover your wallet.
              <br />
              <b>If you lose this words your funds could be lost.</b>
            </span>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="4">
          <v-card-text class="text-center">
            <span class="text--secondary"
              >Click each word in the correct order.</span
            >
            <br />
            <span
              v-for="(word, index) in mnemonicSeed.split(' ').sort()"
              :key="index"
            >
              <v-chip
                v-if="wordVisible[index]"
                outlined
                class="ml-2 mt-2"
                @click="clickSeedWord(word, index)"
                >{{ word }}</v-chip
              >
            </span>
            <v-divider class="mt-2" />
            <v-textarea
              v-model="mnemonicSeedBackup"
              auto-grow
              readonly
              rows="2"
            ></v-textarea>
            <v-btn
              :disabled="mnemonicSeedBackup === ''"
              text
              @click="resetWordList"
              >Reset</v-btn
            >
          </v-card-text>
        </v-window-item>
        <v-window-item :value="5">
          <v-card-text class="pa-4 text-center">
            <v-btn color="primary" text @click="clickCreate"
              >Create wallet</v-btn
            >
          </v-card-text>
        </v-window-item>
      </v-window>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn
          :disabled="step === 1 || mnemonicSeedBackup !== ''"
          text
          @click="step--"
          >Back</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          :disabled="step === steps.length"
          color="primary"
          text
          @click="clickNext"
          >Next</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
const grpcClient = require("@/js/bchwallet-grpc.js");
const walletLoaderService = grpcClient.getWalletLoaderService();

export default {
  name: "InitWalletView",

  components: {},

  data: () => ({
    loading: true,
    step: 1,
    password: "",
    confirmPassword: "",
    mnemonicSeed: "",
    mnemonicSeedBackup: "",
    wordVisible: new Array(12).fill(true),
    rules: [
      value => !!value || "Password can't be left blank",
      value => value.length >= 12 || "Min 12 char."
    ],
    steps: [
      "Welcome",
      "Set a password",
      "Mnemonic seed",
      "Mnemonic seed backup",
      "Ready"
    ]
  }),
  computed: {
    passwordConfirmationRule() {
      return () =>
        this.password === this.confirmPassword || "Passwords don't match";
    }
  },
  mounted() {
    const that = this;
    walletLoaderService.WalletExists({}, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        if (response.exists) {
          openWallet();
        } else {
          that.loading = false;
          GenerateMnemonicSeed(128);
        }
      }
    });
    function openWallet() {
      walletLoaderService.openWallet({}, function(err) {
        if (err) {
          if (err.code == 9) {
            that.$emit("walletReady");
          }
          that.loading = false;
        } else {
          that.$emit("walletReady");
        }
      });
    }
    function GenerateMnemonicSeed(bits) {
      const request = { bit_size: bits };
      walletLoaderService.GenerateMnemonicSeed(request, function(
        err,
        response
      ) {
        if (err) {
          console.log(err);
        } else {
          that.mnemonicSeed = response.mnemonic;
        }
      });
    }
  },
  methods: {
    clickNext() {
      switch (this.step) {
        case 2:
          if (
            this.password === this.confirmPassword &&
            this.password != "" &&
            this.password.length >= 12
          ) {
            this.step++;
          }
          break;
        case 4:
          if (this.mnemonicSeed === this.mnemonicSeedBackup) {
            this.step++;
          }
          break;
        default:
          this.step++;
      }
    },
    clickSeedWord(word, index) {
      this.wordVisible[index] = false;
      if (this.mnemonicSeedBackup.split(" ").length != 12) {
        this.mnemonicSeedBackup = this.mnemonicSeedBackup.concat(word, " ");
      } else {
        this.mnemonicSeedBackup = this.mnemonicSeedBackup.concat(word);
      }
    },
    resetWordList() {
      this.mnemonicSeedBackup = "";
      for (let i = 0; i < 12; i++) {
        this.wordVisible[i] = true;
      }
    },
    clickCreate() {
      this.loading = true;
      const that = this;
      const birthday = new Date().getTime() / 1000;
      const request = {
        private_passphrase: Buffer.from(this.password),
        mnemonic_seed: this.mnemonicSeed,
        wallet_birthday: birthday
      };
      walletLoaderService.CreateWallet(request, function(err) {
        if (err) {
          console.log(err);
        } else {
          //Wallet created
          that.$emit("walletReady");
        }
      });
    }
  }
};
</script>
