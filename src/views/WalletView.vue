<template>
  <div>
    <v-card>
      <div id="div1" class="d-flex justify-center">
        <component
          :is="activeComponent"
          :balance="balance"
          :exchange-rate="exchange.rate"
          :currency="exchange.currency"
          :address="receive.address"
          :amount="receive.amount"
        />
      </div>
      <v-divider />
      <v-tabs v-model="tabs" grow>
        <v-tab>
          <v-icon left>mdi-arrow-up</v-icon>
          <span class="d-none d-sm-flex">Send</span>
        </v-tab>
        <v-tab>
          <v-icon left>mdi-swap-horizontal</v-icon>
          <span class="d-none d-sm-flex">Transactions</span>
        </v-tab>
        <v-tab>
          <v-icon left>mdi-arrow-down</v-icon>
          <span class="d-none d-sm-flex">Receive</span>
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <SendForm
            :balance="balance"
            :exchange-rate="exchange.rate"
            :currency="exchange.currency"
            @send="sendFormEvent"
          />
        </v-tab-item>
        <v-tab-item>
          <TransactionList
            :transactions="transactions"
            :network-block-height="network.networkBlockHeight"
            :exchange-rate="exchange.rate"
            :fiat-currency="exchange.currency"
          />
        </v-tab-item>
        <v-tab-item>
          <ReceiveForm
            :exchange-rate="exchange.rate"
            :currency="exchange.currency"
            @input="setReceiveAmount"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <v-footer
      v-if="network.walletBlockHeight !== network.networkBlockHeight"
      fixed
      color="background"
    >
      <v-col cols="12">
        <span>
          {{ network.walletBlockHeight }} /
          {{ network.networkBlockHeight }}
        </span>
        <v-progress-linear indeterminate></v-progress-linear>
      </v-col>
    </v-footer>
    <ConfirmTransactionDialog
      :active="dialogs.confirmTransaction"
      :amount="send.amount"
      :exchange-rate="exchange.rate"
      :currency="exchange.currency"
      :address="send.address"
      @closeDialog="dialogs.confirmTransaction = false"
      @confirm="sendBCH"
    />
    <BaseDialog
      :active="dialogs.wrongPasswordDialog"
      :title="'Wrong password'"
      :text="'The wallet can\'t be unlocked.'"
      :persistent="true"
      @closeDialog="dialogs.wrongPasswordDialog = false"
    />
  </div>
</template>

<style scoped>
#div1 {
  height: 225px;
}
</style>

<script>
import BalancePanel from "@/components/BalancePanel.vue";
import ReceivePanel from "@/components/ReceivePanel.vue";
import TransactionList from "@/components/TransactionList.vue";
import SendForm from "@/components/SendForm.vue";
import ReceiveForm from "@/components/ReceiveForm.vue";
import ConfirmTransactionDialog from "@/components/dialogs/ConfirmTransactionDialog.vue";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";

import { getExchangeRate } from "@/js/exchange-rates.js";

const grpcClient = require("@/js/bchwallet-grpc.js");
const walletService = grpcClient.getWalletService();

const store = require("@/js/config.js");

export default {
  name: "WalletView",
  components: {
    BalancePanel,
    ReceivePanel,
    TransactionList,
    SendForm,
    ReceiveForm,
    ConfirmTransactionDialog,
    BaseDialog
  },
  data: () => ({
    tabs: 1,
    receive: { amount: 0, address: "" },
    send: { amount: 0, address: "" },
    networkFee: 1,
    balance: 0,
    exchange: { rate: 0, currency: "" },
    network: { walletBlockHeight: 0, networkBlockHeight: 0 },
    transactions: {},
    dialogs: { confirmTransaction: false, wrongPasswordDialog: false }
  }),
  computed: {
    activeComponent() {
      switch (this.tabs) {
        case 2:
          return ReceivePanel;
        default:
          return BalancePanel;
      }
    }
  },
  mounted() {
    this.exchange.currency = store.get("fiatCurrency");
    this.networkFee = store.get("networkFee");
    const that = this;
    function updateExchangeRate() {
      getExchangeRate(that.exchange.currency, "BitPay")
        .then(result => {
          that.exchange.rate = result;
        })
        .catch(err => console.log(err));
    }
    function updateBalance() {
      walletService.Balance({}, function(err, response) {
        if (err) {
          console.log(err);
        } else {
          that.balance = response.total * 1e-8;
        }
      });
    }
    function updateCurrentAddress() {
      walletService.currentAddress({}, function(err, response) {
        if (err) {
          console.log(err);
        } else {
          that.receive.address = response.address;
        }
      });
    }
    function updateTransactions() {
      walletService.getTransactions({}, function(err, response) {
        if (err) {
          console.log(err);
        } else {
          that.transactions = response;
        }
      });
    }
    function updateWalletInfo() {
      updateExchangeRate();
      updateBalance();
      updateCurrentAddress();
      updateTransactions();
    }
    updateWalletInfo();
    let transactionNotifications = walletService.TransactionNotifications({});
    transactionNotifications.on("data", function(response) {
      updateExchangeRate();
      if (response.unmined_transaction_hashes.length > 0) {
        if (that.tabs == 2) {
          that.tabs = 1;
        }
        updateWalletInfo();
      }
      response.attached_blocks.forEach(block => {
        if (block.transactions.length > 0) {
          updateWalletInfo();
        }
        if (that.network.walletBlockHeight < block.height) {
          that.network.walletBlockHeight = block.height;
        }
        if (that.network.networkBlockHeight < block.height) {
          that.network.networkBlockHeight = block.height;
        }
      });
    });
    function updateNetworkBlockHeight() {
      walletService.Network({}, function(err, response) {
        if (err) {
          console.log(err);
        } else {
          that.network.networkBlockHeight = response.best_height;
        }
      });
    }
    updateNetworkBlockHeight();
    function updateWalletBlockHeight() {
      walletService.Accounts({}, function(err, response) {
        if (err) {
          console.log(err);
        } else {
          that.network.walletBlockHeight = response.current_block_height;
        }
      });
    }
    updateWalletBlockHeight();
    let rescanNotifications = walletService.RescanNotifications({});
    rescanNotifications.on("data", function(response) {
      if (response.finished) {
        updateWalletInfo();
      }
      that.network.walletBlockHeight = response.height;
      if (that.network.networkBlockHeight < response.height) {
        updateNetworkBlockHeight();
      }
    });
  },
  methods: {
    setReceiveAmount(amount) {
      this.receive.amount = amount;
    },
    sendFormEvent(sendObject) {
      this.send = sendObject;
      this.dialogs.confirmTransaction = true;
    },
    sendBCH(passphrase) {
      const that = this;
      if (that.balance > that.send.amount) {
        createTransaction();
      } else {
        sweepAccount();
      }
      function createTransaction() {
        walletService.CreateTransaction(
          {
            account: 0,
            outputs: [
              { address: that.send.address, amount: that.send.amount * 1e8 }
            ],
            required_confirmations: 0,
            sat_per_kb_fee: 1024 * that.networkFee
          },
          function(err, response) {
            if (err) {
              console.log(err);
            } else {
              signTransaction(passphrase, response);
            }
          }
        );
      }
      function sweepAccount() {
        walletService.SweepAccount(
          {
            account: 0,
            sweep_to_address: that.send.address,
            sat_per_kb_fee: 1024 * that.networkFee
          },
          function(err, response) {
            if (err) {
              console.log(err);
            } else {
              signTransaction(passphrase, response);
            }
          }
        );
      }
      function signTransaction(passphrase, transaction) {
        walletService.SignTransaction(
          {
            passphrase: Buffer.from(passphrase),
            serialized_transaction: transaction.serialized_transaction,
            input_values: transaction.input_values
          },
          function(err, response) {
            if (err) {
              console.log(err);
              if (err.code == 3) {
                that.dialogs.wrongPasswordDialog = true;
              }
            } else {
              publishTransaction(response.transaction);
            }
          }
        );
      }
      function publishTransaction(signedTransaction) {
        walletService.PublishTransaction(
          {
            signed_transaction: signedTransaction
          },
          function(err) {
            if (err) {
              console.log(err);
            } else {
              that.tabs = 1;
            }
          }
        );
      }
    }
  }
};
</script>
