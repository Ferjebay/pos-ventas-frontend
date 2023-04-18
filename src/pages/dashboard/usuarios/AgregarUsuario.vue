<template>
  <q-card style="width: 700px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6">Agregar Usuario</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit">
        <div class="row q-gutter-sm justify-around">
          <div class="col-xs-12 col-sm-5">
            <label>Nombres:</label>
            <q-input v-model="formUsuario.nombres" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 ">
            <label>Apellidos:</label>
            <q-input v-model.trim="formUsuario.apellidos" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Cedula:</label>
            <q-input v-model.trim="formUsuario.cedula"
            minlength="10" maxlength="10" type="number" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Celular:</label>
            <q-input v-model.trim="formUsuario.celular" type="number" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Email:</label>
            <q-input v-model.trim="formUsuario.email" type="email" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Rol:</label>
            <q-select filled required dense emit-value map-options
              v-model="formUsuario.rol_id" :options="listRoles" />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Contraseña:</label>
            <q-input dense filled
            placeholder="********"
            v-model.trim="formUsuario.password"
            :type="isPwd ? 'password' : 'text'" required >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Confirmar Contraseña:</label>
            <q-input dense filled
              placeholder="********"
              v-model.trim="formUsuario.confirmPassword"
              :type="isPwd2 ? 'password' : 'text'" required >
              <template v-slot:append>
                <q-icon
                  :name="isPwd2 ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd2 = !isPwd2"
                />
              </template>
            </q-input>
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Punto de Venta:</label>
            <q-select filled required dense emit-value map-options
              v-model="formUsuario.pv_id" :options="listPuntosVentas" />
          </div>


          <div class="col-xs-9 col-sm-12  flex justify-center">
            <q-btn label="Guardar" class="q-px-xl" :loading="loading"
              type="submit" color="green-9"/>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import Api from "../../../apis/Api"
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'AgregarUsuario',
  setup(_,  { emit }) {

    const formUsuario = ref({
      rol_id: '',
      pv_id: '',
      nombres: '',
      apellidos: '',
      cedula: '',
      celular: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    const listRoles = ref([]);
    const loading = ref( false );
    const listPuntosVentas = ref([]);
    const $q = useQuasar()

    const getRoles = async () => {
      try {
        const { data: { roles } } = await Api.get('/roles');
        listRoles.value = [];

        roles.forEach(rol => {
          listRoles.value.push({ label: rol.nombre, value: rol.id })
        });
      } catch (error) {
        alert(error)
      }
    }

    const getPuntosVentas = async () => {
      try {
        const { data: { puntos_ventas } } = await Api.get('/puntos_ventas');
        listPuntosVentas.value = [];

        puntos_ventas.forEach(pv => {
          listPuntosVentas.value.push({ label: pv.nombre, value: pv.id })
        });

      } catch (error) {
        alert(error)
      }
    }

    getRoles();
    getPuntosVentas();

    const onSubmit = async () => {
      if (formUsuario.value.password !== formUsuario.value.confirmPassword)
        return alert("Las contraseñas no son iguales");

      try {
        loading.value = true;
        await Api.post('/usuarios', formUsuario.value)
        emit('actualizarLista');
        $q.notify({
          color: 'positive',
          message: 'Usuario Agregado Exitosamente',
          icon: 'done'
        })
        loading.value = false;
      } catch (error) {
        loading.value = false;
        $q.notify({
          color: 'warning',
          message: error.response.data.errors[0].msg,
          position: 'top-right'
        })
      }
    }

    watch(formUsuario.value, (currentValue, oldValue) => {
      formUsuario.value.nombres = currentValue.nombres.toUpperCase();
      formUsuario.value.apellidos = currentValue.apellidos.toUpperCase()
    });

    return {
      listRoles,
      listPuntosVentas,
      loading,
      formUsuario,
      onSubmit,
      isPwd: ref(true),
      isPwd2: ref(true),
    }
  }
})
</script>
