const axios = require("axios");

export function getExchangeRate(ccyCode, provider) {
  switch (provider) {
    case "BitPay":
      return getBitpayRate(ccyCode);
    default:
      throw Error("Unknown Provider");
  }
}
export function getCurrencies(provider) {
  switch (provider) {
    case "BitPay":
      return getBitpayCurrencies();
    default:
      throw Error("Unknown Provider");
  }
}
export function getProviders() {
  return ["BitPay"];
}
function getBitpayCurrencies() {
  const bitpayRatesAPI = "https://bitpay.com/rates/BCH";
  let currencies = [];
  return axios
    .get(bitpayRatesAPI)
    .then(response => {
      const data = response.data.data;
      for (let i = 0; i < data.length; i++) {
        currencies.push(data[i].code);
      }
      return currencies;
    })
    .catch(err => {
      console.log(err);
    });
}
function getBitpayRate(ccyCode) {
  const bitpayRatesAPI = "https://bitpay.com/rates/BCH";
  return axios
    .get(bitpayRatesAPI)
    .then(response => {
      const data = response.data.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].code == ccyCode) {
          return data[i].rate;
        }
      }
      throw Error("Currency code not found in data");
    })
    .catch(err => {
      console.log(err);
    });
}
