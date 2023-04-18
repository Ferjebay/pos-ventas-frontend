<template>
  <section class="area-login">
    <h1 class="title">Iniciar Sesion</h1>
    <div class="login">
      <!-- <div> -->
      <div class="element-form">
        <img src="~assets/logo.jpeg"  />
      </div>
      <form @submit.prevent="onSubmit" class="element-form">
          <q-input
            label-color="blue-grey-3"
            class="q-mb-lg"
            bg-color="blue-grey-10"
            filled label="Ingresa tu email"
            v-model.trim="form.email"
            required
            >
            <template v-slot:prepend>
              <q-icon name="person" color="blue-grey-3" />
            </template>
          </q-input>

          <q-input
            type="password"
            label-color="blue-grey-3"
            filled
            bg-color="blue-grey-10"
            label="Ingresa tu contraseña"
            v-model.trim="form.password"
            required
            >
            <template v-slot:prepend>
              <q-icon name="key" color="blue-grey-3" />
            </template>
          </q-input>
          <!-- <input type="submit" value="entrar" style="height: 45px;" /> -->
          <q-btn label="Ingresar"
            class="q-px-xl"
            :loading="loading"
            type="submit"
            color="deep-purple-6"/>
      </form>
        <!-- </div> -->
    </div>
  </section>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from "vue-router";
import { useAuthUserStore } from "stores/auth-user"
import JWT from 'jwt-client'
import { Loading } from 'quasar'
import useHelpers from "../../composables/useHelpers";

import Api from "../../apis/Api"

export default defineComponent({
  name: 'Login',

  setup(){
    const loading = ref( false );
    const { mostrarNotify } = useHelpers();
    const form = ref({
      email: "",
      password: ""
    })

    const router = useRouter();

    return{
      form,
      loading,
      onSubmit: async () => {
        try {
          loading.value = true;
          const { data: { token } } = await Api.post('/auth/login', form.value)
          const authUserStore = useAuthUserStore();

          authUserStore.setToken( token );

          const { claim: {user} } = JWT.read( token );

          const { data } = await Api.get(`/roles/getPermisos/${ user.rol_id }`)
          let permisos = [];

          data.permisos.forEach(permiso => permisos.push( permiso.nombre ));

          authUserStore.setPermisos( permisos );
          Loading.hide();
          router.push('/');
          loading.value = false;
        } catch ({ response: { data } }) {
          mostrarNotify('warning', data.msg, 'top');
          loading.value = false;
        }
      },
      router
    }
  }

})
</script>

<style >
.area-login {
  display: flex;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: #1b1f27;
}

.title {
  color: #cbd0f7;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 40px;
}

.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: #181920;
  width: 340px;
  height: 494px;
  border-radius: 8px;
  padding: 35px;
}

.login form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.login input {
  color: #cbd0f7;
  border: none;
  outline: none;
  border-radius: 8px;
}

.login img {
  width: 16rem;
  height: auto;
  margin-top: 84px;
  margin-bottom: 17px;
}

input::placeholder {
  color: #cbd0f7;
  font-size: 14px;
  text-transform: capitalize;
}

form [type="submit"] {
  display: inline-block;
  background-color: #5568fe;
  font-size: 17px;
  text-transform: uppercase;
  font-weight: bold;
  margin: 25px 0;
  cursor: pointer;

  opacity: 0.8;
}

form [type="submit"]:hover {
  opacity: 1;
}
p a {
  color: #5568fe;
  text-decoration: none;
  font-weight: 500;
}
.title, .login{
  position: relative;
  bottom: 4rem;
}
.element-form{
  position: relative;
  bottom: 2rem;
}
.crear-cuenta{
  margin-bottom: 5rem;
}

</style>
