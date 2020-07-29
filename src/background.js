/* global __static */
"use strict";

import { app, protocol, BrowserWindow, dialog, Menu, Tray } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { autoUpdater } from "electron-updater";

const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const isDevelopment = process.env.NODE_ENV !== "production";
//Ensure only one instance
let isSingleInstance = app.requestSingleInstanceLock();

//Start BCHWallet
let bchwalletLocation = process.env.PORTABLE_EXECUTABLE_DIR
  ? process.env.PORTABLE_EXECUTABLE_DIR
  : process.cwd();
bchwalletLocation = path.join(bchwalletLocation, "bchwallet");
let bchwallet = process.platform === "win32" ? "bchwallet.exe" : "bchwallet";
const settings = [
  "--usespv",
  "--experimentalrpclisten=127.0.0.1",
  "--noinitialload"
];
let bchwalletExists = false;
if (fs.existsSync(path.join(bchwalletLocation, bchwallet))) {
  bchwalletExists = true;
}
const child = execFile(path.join(bchwalletLocation, bchwallet), settings);

//log BCHWallet console info
child.stdout.on("data", data => {
  console.log("child stdout:\n" + data);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray;
let isQuiting;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Neutron Cash",
    icon: path.join(__static, "icon.png"),
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      spellcheck: false,
      enableRemoteModule: true
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.removeMenu();
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }
  win.on("close", event => {
    if (!isQuiting) {
      event.preventDefault();
      win.hide();
      event.returnValue = false;
    }
  });
  win.on("closed", () => {
    win = null;
  });
}
app.on("will-quit", function() {
  isQuiting = true;
  child.kill();
});
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    await installExtension(VUEJS_DEVTOOLS);
  }
  if (!isSingleInstance) {
    dialog.showErrorBox(
      "Error",
      "Another instance of Neutron Cash is already running."
    );
    app.quit();
  }
  if (bchwalletExists) {
    tray = new Tray(path.join(__static, "icon.png"));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open Neutron Cash",
        click: () => {
          win.show();
        }
      },
      {
        label: "Minimize to tray",
        click: () => {
          win.hide();
        }
      },
      {
        label: "Quit",
        click: () => {
          isQuiting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip("Neutron Cash");
    tray.setContextMenu(contextMenu);
    createWindow();
  } else {
    dialog.showErrorBox(
      "Error",
      path.join(bchwalletLocation, bchwallet) + " not found."
    );
    app.quit();
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
