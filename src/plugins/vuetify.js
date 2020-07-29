import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: { customProperties: true },
    dark: false,
    themes: {
      light: {
        primary: "#43a047",
        error: "#757575",
        background: "#ffffff"
      },
      dark: {
        primary: "#43a047",
        error: "#757575",
        background: "#121212"
      }
    }
  }
});
