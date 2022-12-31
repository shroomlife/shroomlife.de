<template>
  <div id="app">
    <form v-if="!loggedIn" @submit.prevent="doLogin">
      <div class="form-group">
        <input type="password" class="form-control" placeholder="Password" v-model="login.password" />
      </div>
      <button type="submit" class="btn btn-primary btn-block">Anmelden</button>
    </form>
    <div v-else>
      <div v-if="isLoading">
        <div class="d-flex">
          <p>Daten werden geladen ...</p>
        </div>
      </div>
      <div v-else>
        <div class="row mb-3">
          <div class="col-6" v-for="contact in mm" :key="contact.name">
            <a class="btn btn-info btn-lg btn-block" :href="getPhoneLink(contact)"><MdCallIcon /> {{contact.name}}<br /><small>{{contact.phone}}</small></a>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="list-group text-left">
              <a v-for="contact in contacts" :key="contact.name" :href="getPhoneLink(contact)" class="list-group-item list-group-item-action">
                <div class="row">
                  <div class="col-5">
                    <button class="btn btn-success"><MdCallIcon /> Anrufen</button>
                  </div>
                  <div class="col">
                    <div><h3>{{contact.name}}</h3></div>
                    <div>{{contact.phone}}</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-12">
            <button class="btn btn-danger btn-block mt-3" @click.prevent="doLogout">Ausloggen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MdCallIcon from 'vue-ionicons/dist/md-call.vue'

export default {
  name: "App",
  data: function () {
    return {
      login: {
        password: "",
        token: false,
      },
      isLoading: true,
      contacts: [],
      mm: []
    };
  },
  components: {
    MdCallIcon
  },
  computed: {
    loggedIn() {
      return String(this.login.token).length === 255;
    },
  },
  methods: {
    doLogout() {
      this.contacts = []
      this.login = {
        password: "",
        token: false,
      }
      this.isLoading = true
    },
    getPhoneLink(contact) {
      return `tel:${contact.phone}`
    },
    reset() {
      this.login.token = false;
      this.login.password = "";
    },
    showException() {
      console.log('aaaa', new Error().stack)
      this.$swal(
        "Unbekannter Fehler",
        "Es gab einen unbekannten Fehler!",
        "error"
      );
      this.reset();
    },
    doLogin() {
      const loginRequestConfig = {
        method: "post",
        data: {
          password: this.login.password
        },
        url: "/mm",
      };
      axios(loginRequestConfig)
        .then((response) => {
          console.log('Response Length', response.data.length, response.data)
          if (response.data.length === 255) {
            this.login.token = String(response.data);
          } else this.showException();
        })
        .catch(() => {
          this.$swal(
            "Loginfehler",
            "Du hast ein falsches Passwort eingegeben.",
            "error"
          );
          this.reset();
        });
    },
    loadContacts() {
      if(this.login.token === false) return this.doLogout()
      const loginRequestConfig = {
        method: "get",
        url: "/mmA",
        headers: {
          "mm-key": this.login.token,
        },
      };
      axios(loginRequestConfig)
        .then(response => {
          this.contacts = response.data.angels.slice(0);
          this.mm = response.data.mm.slice(0);
          this.isLoading = false
        })
        .catch(e => {
          console.error(e)
          this.showException();
        });
    },
  },
  watch: {
    loggedIn(newState) {
      newState === true && this.loadContacts();
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 60px;
}
a {
  cursor: pointer;
}
h3 {
  font-weight: bold;
  margin-bottom: 0;
}
div.ion {
  vertical-align: text-top;
}
.swal2-actions button {
  line-height: 40px;
}
</style>
