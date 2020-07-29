/* global __static */
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const os = require("os");
const fs = require("fs");

const conURL = "localhost:8332";

const protoPath = path.join(__static, "api.proto");
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

let certPath = path.join(os.homedir(), ".bchwallet", "rpc.cert");
if (os.platform == "win32") {
  certPath = path.join(
    os.homedir(),
    "AppData",
    "Local",
    "Bchwallet",
    "rpc.cert"
  );
} else if (os.platform == "darwin") {
  certPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Bchwallet",
    "rpc.cert"
  );
}

const cert = fs.readFileSync(certPath);
const creds = grpc.credentials.createSsl(cert);
const walletrpc = grpc.loadPackageDefinition(packageDefinition).walletrpc;

module.exports = {
  getWalletLoaderService: function() {
    return new walletrpc.WalletLoaderService(conURL, creds);
  },
  getWalletService: function() {
    return new walletrpc.WalletService(conURL, creds);
  },
  getVersionService: function() {
    return new walletrpc.VersionService(conURL, creds);
  }
};
