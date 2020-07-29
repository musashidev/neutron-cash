<template>
  <div>
    <v-navigation-drawer v-model="drawer" app right disable-resize-watcher>
      <v-list nav>
        <v-subheader>MENU</v-subheader>
        <v-list-item-group v-model="model" mandatory>
          <v-list-item
            v-for="item in items"
            :key="item.title"
            @click="changeRoute(item.title)"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">{{
                item.title
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="background" flat>
      <v-toolbar-title class="ml-4 text--secondary headline"
        >Neutron Cash</v-toolbar-title
      >
      <v-spacer />
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: "TheNavbar",

  components: {},

  data: () => ({
    drawer: null,
    items: [
      { title: "Wallet", icon: "mdi-wallet" },
      { title: "Settings", icon: "mdi-cog" }
    ],
    model: 0
  }),
  methods: {
    changeRoute(route) {
      this.$emit("changeRoute", route);
      this.drawer = !this.drawer;
    }
  }
};
</script>
