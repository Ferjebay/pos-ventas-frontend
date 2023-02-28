<template>
  <q-card style="width: 700px; max-width: 80vw;">
    <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Editar Articulo(s)</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

    <q-card-section>
      <q-form>
        <div class="row q-gutter-md">
          <div class="offset-1 col-xs-10 col-sm-5">
            <label>Marca:</label>
            <q-input v-model.trim="formArticulo.marca" dense filled required />
          </div>

          <div class="col-xs-10 col-sm-5 ">
            <label>Modelo:</label>
            <q-input v-model.trim="formArticulo.modelo" dense filled required />
          </div>

          <div class="offset-1 col-xs-10 col-sm-5 ">
            <label>Proveedor:</label>
            <q-select filled required dense emit-value map-options
              v-model="formArticulo.proveedor_id" :options="listProveedores" />
          </div>

          <div class="col-xs-10 col-sm-5 ">
            <label>Precio Base:</label>
            <q-input type="number" v-model.trim="formArticulo.precio_base" dense filled required />
          </div>

          <div class="offset-1 col-xs-10 col-sm-6">
            <label>Ingresar Codigo IMEI:</label>
            <q-input dense filled v-model.trim="formArticulo.imei" />
          </div>

          <div class="col-xs-10 col-sm-4">
            <label>Color:</label>
            <q-input dense filled v-model.trim="formArticulo.color" />
          </div>

          <div class="col-xs-9 col-sm-12  flex justify-center">
            <q-btn @click="submit" :loading="loading" label="Editar" class="q-px-xl" color="green-9"/>
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
  name: 'EditarArticulo',
  props: ['articuloData'],
  setup(props,  { emit }) {

    const { id, proveedor_id, marca, modelo, precio_base, imei, color } = props.articuloData;

    const formArticulo = ref({
      marca,
      modelo,
      proveedor_id,
      precio_base: precio_base.toFixed(2),
      imei,
      color
    })
    const listProveedores = ref([]);
    const loading = ref( false );
    const $q = useQuasar();

    const mostrarDialog = (type, message) => {
      $q.notify({
        type,
        message,
        position: 'top-right'
      })
    }

    const getProveedores = async () => {
      try {
        const { data: { proveedores } } = await Api.get('/proveedores');
        listProveedores.value = [];

        proveedores.forEach(proveedor => {
          listProveedores.value.push({ label: proveedor.razon_social, value: proveedor.id })
        });
      } catch (error) {
        alert(error)
      }
    }

    getProveedores();

    const submit = async () => {
      if ( formArticulo.value.marca.length == 0 )
        return mostrarDialog('warning', 'Por favor, completa el campo marca')

      if ( formArticulo.value.modelo.length == 0 )
        return mostrarDialog('warning', 'Por favor, completa el campo modelo')

      if ( formArticulo.value.proveedor_id.length == 0 )
        return mostrarDialog('warning', 'Por favor, elige un proveedor')

      if ( formArticulo.value.precio_base.length == 0 )
        return mostrarDialog('warning', 'Por favor, ingresa el precio base')

      try {
        loading.value = true;

        await Api.put(`/articulos/${ id }`, formArticulo.value)

        mostrarDialog('positive', 'Articulo editado exitosamente');

        emit('actualizarLista');

        loading.value = false;
      } catch (error) {
        alert(error);
        loading.value = false;
      }
    }

    watch(formArticulo.value, (currentValue, _) => {
      formArticulo.value.marca = currentValue.marca.toUpperCase();
      formArticulo.value.modelo = currentValue.modelo.toUpperCase()
    });

    return {
      listProveedores,
      loading,
      formArticulo,
      submit
    }
  }
})
</script>
