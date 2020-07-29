<template>
  <v-app>
    <TheNavbar @changeRoute="changeRoute" />
    <v-main :style="{ background: $vuetify.theme.themes[theme].background }">
      <v-container>
        <component :is="activeView" @walletReady="openWallet" />
      </v-container>
    </v-main>
  </v-app>
</template>
<style>
::-webkit-scrollbar {
  display: none;
}
</style>
<script>
import TheNavbar from "@/components/TheNavbar.vue";
import WalletView from "@/views/WalletView.vue";
import SettingsView from "@/views/SettingsView.vue";
import InitWalletView from "@/views/InitWalletView.vue";

const grpcClient = require("@/js/bchwallet-grpc.js");
const versionService = grpcClient.getVersionService();

export default {
  name: "App",

  components: {
    TheNavbar
  },

  data: () => ({
    activeView: null,
    walletReady: false
  }),
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    }
  },
  mounted() {
    const store = require("@/js/config.js");
    if (store.get("darkTheme")) {
      this.$vuetify.theme.dark = true;
    }
    //Do not initialize until the server is ready
    //Ping wallet until we get a response
    //Use version request as it works with --noinitialload
    const that = this;
    const pingWalletInterval = setInterval(function() {
      versionService.Version({}, function(err) {
        if (err) {
          console.log(err);
        } else {
          clearInterval(pingWalletInterval);
          that.activeView = InitWalletView;
        }
      });
    }, 500);
  },
  methods: {
    changeRoute(route) {
      switch (route) {
        case "Wallet":
          this.activeView = this.walletReady ? WalletView : InitWalletView;
          break;
        case "Settings":
          this.activeView = SettingsView;
          break;
      }
    },
    openWallet() {
      this.walletReady = true;
      this.activeView = WalletView;
    }
  }
};
</script>
