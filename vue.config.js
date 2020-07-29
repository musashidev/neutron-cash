module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        publish: ["github"],
        win: {
          target: ["portable"]
        },
        linux: {
          target: ["AppImage"]
        }
      }
    }
  },
  transpileDependencies: ["vuetify"]
};
