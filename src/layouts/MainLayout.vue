<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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
    icon: 'group',
    link: '/usuarios',
    permisoRequerido: 'Ver Usuarios'
  },
  {
    title: 'Proveedores',
    icon: 'playlist_add_check',
    link: '/proveedor',
    permisoRequerido: 'Ver Proveedores'
  },
  {
    title: 'Roles',
    icon: 'settings',
    link: '/roles',
    permisoRequerido: 'Ver Roles'
  },
  {
    title: 'Articulos',
    icon: 'inventory',
    link: '/articulos',
    permisoRequerido: 'Ver Articulos'
  },
  {
    title: 'Ventas',
    icon: 'shopping_cart',
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
