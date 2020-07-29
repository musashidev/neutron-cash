const Store = require("electron-store");

const schema = {
  networkFee: {
    type: "number",
    maximum: 10,
    minimum: 1,
    default: 1
  },
  fiatCurrency: {
    type: "string",
    default: "USD"
  },
  darkTheme: {
    type: "boolean",
    default: false
  }
};

module.exports = new Store({ schema });
