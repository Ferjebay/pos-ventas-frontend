<template>
  <q-card style="width: 600px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6">Editar Proveedor</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit">
        <div class="row q-gutter-sm justify-around">
          <div class="col-xs-12 col-sm-11">
            <label>Razon Social:</label>
            <q-input v-model="formProveedor.razon_social" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Tipo de Documento:</label>
            <q-select v-model="formProveedor.tipo_documento" filled :options="options" />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Numero de Documento:</label>
            <q-input v-model.trim="formProveedor.numero_documento" type="number" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Email:</label>
            <q-input v-model.trim="formProveedor.email" type="email" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-5 q-my-md">
            <label>Celular:</label>
            <q-input v-model.trim="formProveedor.celular" type="number" dense filled required />
          </div>

          <div class="col-xs-12 col-sm-11">
            <label>Dirección:</label>
            <q-input v-model="formProveedor.direccion" dense filled required />
          </div>

          <div class="col-xs-9 col-sm-12  flex justify-center">
            <q-btn :loading="loading"
              label="Editar" class="q-px-xl" type="submit" color="green-9"/>
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
  name: 'EditarProveedor',
  props: ['proveedorData'],
  setup(props,  { emit }) {
    const {
      id,
      razon_social,
      direccion,
      tipo_documento,
      numero_documento,
      celular,
      email
    } = props.proveedorData;
    const loading = ref( false );
    const formProveedor = ref({
      id,
      razon_social,
      tipo_documento,
      numero_documento,
      email,
      celular,
      direccion
    })

    const $q = useQuasar()

    const onSubmit = async () => {
      try {
          loading.value = true;
          await Api.put('/proveedores', formProveedor.value)
          emit('actualizarLista');
          $q.notify({
            color: 'positive',
            message: 'Proveedor Editado Exitosamente',
            icon: 'done'
          })
          loading.value = false;
        } catch (error) {
          alert(error);
          loading.value = false;
        }
    }

    watch(formProveedor.value, (currentValue, oldValue) => {
      formProveedor.value.razon_social = currentValue.razon_social.toUpperCase();
    });

    return {
      formProveedor,
      loading,
      onSubmit,
      options: [
        'Cedula', 'RUC', 'Pasaporte'
      ]
    }
  }
})
</script>
