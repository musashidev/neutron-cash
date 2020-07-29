<template>
  <div>
    <v-card>
      <v-list>
        <v-list-item
          v-for="item in settingsList"
          :key="item.title"
          @click="itemClick(item.click)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">
              {{ item.title }}
            </v-list-item-title>
            <v-list-item-subtitle class>
              {{ item.subtitle }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
    <v-switch
      v-model="isDarkTheme"
      class="ma-2"
      label="Dark theme"
      @change="darkTheme"
    ></v-switch>
    <ChangeCurrencyDialog
      :current-currency="fiatCurrency"
      :active="dialogs.changeCurrency"
      @confirm="confirmChangeCurrency"
      @closeDialog="dialogs.changeCurrency = false"
    />
    <ChangeFeeDialog
      :current-fee="networkFee"
      :active="dialogs.changeFee"
      @confirm="confirmChangeFee"
      @closeDialog="dialogs.changeFee = false"
    />
    <RecoverWalletDialog
      :active="dialogs.recoverWallet"
      @confirm="confirmRecoverWallet"
      @closeDialog="dialogs.recoverWallet = false"
    />
    <RecoverWalletPasswordDialog
      :active="dialogs.recoverWalletPassword"
      @confirm="recoverWallet"
      @closeDialog="dialogs.recoverWalletPassword = false"
    />
    <BaseDialog
      :active="dialogs.restartWallet"
      :title="'Restart needed'"
      :text="'Please restart Neutron Cash to continue.'"
      :persistent="true"
      :closeable="false"
    />
  </div>
</template>

<script>
const store = require("@/js/config.js");

import ChangeCurrencyDialog from "@/components/dialogs/ChangeCurrencyDialog.vue";
import ChangeFeeDialog from "@/components/dialogs/ChangeFeeDialog.vue";
import RecoverWalletDialog from "@/components/dialogs/RecoverWalletDialog.vue";
import RecoverWalletPasswordDialog from "@/components/dialogs/RecoverWalletPasswordDialog.vue";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";

export default {
  name: "SettingsView",
  components: {
    ChangeCurrencyDialog,
    ChangeFeeDialog,
    RecoverWalletDialog,
    RecoverWalletPasswordDialog,
    BaseDialog
  },
  data: () => ({
    items: {
      fiatCurrency: {
        title: "Fiat Currency",
        subtitle: "",
        icon: "mdi-currency-usd",
        click: "fiatCurrencyClick"
      },
      networkFee: {
        title: "Network Fee",
        subtitle: "",
        icon: "mdi-circle-multiple-outline",
        click: "networkFeeClick"
      },
      recoverWallet: {
        title: "Recover Wallet",
        subtitle: "",
        icon: "mdi-restart-alert",
        click: "recoverWalletClick"
      }
    },
    networkFee: 1,
    fiatCurrency: "",
    mnemonicSeed: "",
    isDarkTheme: false,
    dialogs: {
      changeCurrency: false,
      changeFee: false,
      recoverWallet: false,
      recoverWalletPassword: false,
      restartWallet: false
    }
  }),
  computed: {
    settingsList: function() {
      let settingsList = this.items;
      settingsList.networkFee.subtitle = this.networkFee
        .toString()
        .concat(" sat/byte");
      settingsList.fiatCurrency.subtitle = this.fiatCurrency;
      return settingsList;
    }
  },
  mounted() {
    this.isDarkTheme = this.$vuetify.theme.dark;
    this.fiatCurrency = store.get("fiatCurrency");
    this.networkFee = store.get("networkFee");
  },
  methods: {
    itemClick(function_name) {
      this[function_name]();
    },
    fiatCurrencyClick() {
      this.dialogs.changeCurrency = true;
    },
    networkFeeClick() {
      this.dialogs.changeFee = true;
    },
    recoverWalletClick() {
      this.dialogs.recoverWallet = true;
    },
    confirmChangeCurrency(currency) {
      store.set("fiatCurrency", currency);
      this.fiatCurrency = currency;
    },
    confirmChangeFee(fee) {
      store.set("networkFee", fee);
      this.networkFee = fee;
    },
    confirmRecoverWallet(seed) {
      this.mnemonicSeed = seed;
      this.dialogs.recoverWalletPassword = true;
    },
    recoverWallet(password) {
      const grpcClient = require("@/js/bchwallet-grpc.js");
      const walletLoaderService = grpcClient.getWalletLoaderService();
      const that = this;
      let walletWasOpen = false;
      walletLoaderService.CloseWallet({}, function(err) {
        if (err) {
          console.log(err);
          backupWallet();
        } else {
          walletWasOpen = true;
          backupWallet();
        }
      });
      function backupWallet() {
        const path = require("path");
        const os = require("os");
        const fs = require("fs");
        let walletPath = path.join(os.homedir(), ".bchwallet", "mainnet");
        if (os.platform == "win32") {
          walletPath = path.join(
            os.homedir(),
            "AppData",
            "Local",
            "Bchwallet",
            "mainnet"
          );
        } else if (os.platform == "darwin") {
          walletPath = path.join(
            os.homedir(),
            "Library",
            "Application Support",
            "Bchwallet",
            "mainnet"
          );
        }
        const walletdb = path.join(walletPath, "wallet.db");
        let walletbck = path.join(walletPath, "wallet.db.bck");
        let i = 1;
        while (fs.existsSync(walletbck)) {
          walletbck = path.join(walletPath, "wallet.db.bck".concat(i));
          i++;
        }
        if (fs.existsSync(walletdb)) {
          fs.copyFileSync(walletdb, walletbck);
          //Delete old wallet
          fs.unlinkSync(walletdb);
        }
        createWallet();
      }
      function createWallet() {
        const birthday = 1501593374; //Block 478558 timestamp (first BCH block)
        const request = {
          private_passphrase: Buffer.from(password),
          mnemonic_seed: that.mnemonicSeed,
          wallet_birthday: birthday
        };
        walletLoaderService.CreateWallet(request, function(err) {
          if (err) {
            console.log(err);
          } else {
            //Wallet created
            if (walletWasOpen) {
              //Due to a bug in bchwallet we can't restart the wallet service
              that.dialogs.restartWallet = true;
            } else {
              that.$emit("walletReady");
            }
          }
        });
      }
    },
    darkTheme() {
      store.set("darkTheme", !this.$vuetify.theme.dark);
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    }
  }
};
</script>
