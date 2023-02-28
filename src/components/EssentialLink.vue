<template>
  <q-item
    v-if="authUserStore.permisos !== null && authUserStore.permisos.includes(permisoRequerido)"
    clickable
    @click="$router.push(link)"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router';
import { useAuthUserStore } from "stores/auth-user"

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: '#'
    },
    icon: {
      type: String,
      default: ''
    },
    permisoRequerido:{
      type: String
    }
  },
  setup(){
    const authUserStore = useAuthUserStore();
    const router = useRouter();

    return {
      authUserStore,
      router
    }
  }
})
</script>
