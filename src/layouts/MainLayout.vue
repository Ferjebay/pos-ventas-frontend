<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar style="background-color: #2D2D8E;">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ `${ user.nombres }  ${ user.apellidos }` }} <span class="q-mx-md">|</span> {{ user.rol_name }}
        </q-toolbar-title>

        <div>
          <q-btn square color="negative"
          @click="cerrarSesion"
          icon="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          MODULOS
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useAuthUserStore } from "stores/auth-user"
import { useRouter } from 'vue-router'
import JWT from 'jwt-client'

const linksList = [
  {
    title: 'Usuarios',
    icon: 'keyboard_arrow_right',
    link: '/usuarios',
    permisoRequerido: 'Ver Usuarios'
  },
  {
    title: 'Puntos de Ventas',
    icon: 'keyboard_arrow_right',
    link: '/pv',
    permisoRequerido: 'Ver PV'
  },
  {
    title: 'Proveedores',
    icon: 'keyboard_arrow_right',
    link: '/proveedor',
    permisoRequerido: 'Ver Proveedores'
  },
  {
    title: 'Clientes',
    icon: 'keyboard_arrow_right',
    link: '/clientes',
    permisoRequerido: 'Ver Clientes'
  },
  {
    title: 'Roles',
    icon: 'keyboard_arrow_right',
    link: '/roles',
    permisoRequerido: 'Ver Roles'
  },
  {
    title: 'Articulos',
    icon: 'keyboard_arrow_right',
    link: '/articulos',
    permisoRequerido: 'Ver Articulos'
  },
  {
    title: 'Ventas',
    icon: 'keyboard_arrow_right',
    link: '/ventas',
    permisoRequerido: 'Ver Ventas'
  },
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const authUserStore = useAuthUserStore();
    const router = useRouter();

    const { claim: {user} } = JWT.read(authUserStore.token);

    const cerrarSesion = () => {
      authUserStore.$reset();
      router.push('/login');
    }

    return {
      cerrarSesion,
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      user
    }
  }
})
</script>
