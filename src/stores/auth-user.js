import { defineStore } from 'pinia';

export const useAuthUserStore = defineStore('auth/user', {
  state: () => ({
    token: null,
    permisos: null
  }),
  persist: true,
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    setToken(token) {
      this.token = token;
    },
    setPermisos( permisos ) {
      this.permisos = permisos;
    }
  },
});
