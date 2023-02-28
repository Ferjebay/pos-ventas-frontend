<template>
  <div class="col-md-10 flex items-center">

    <q-input class="q-ml-md" style="width: 20%"
      filled v-model="formFiltrarArticulo.desde" dense
      mask="date" clearable clear-icon="close">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="formFiltrarArticulo.desde">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
    </q-input>

    <label class="q-mx-md">HASTA:</label>

    <q-input filled style="width: 20%"
      v-model="formFiltrarArticulo.hasta" dense
      mask="date" clearable clear-icon="close">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="formFiltrarArticulo.hasta">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
    </q-input>

    <q-select filled required dense emit-value map-options style="width: 36%;margin-left: 27px;"
        v-model="formFiltrarArticulo.proveedor_id" :options="listProveedores">
        <template v-if="formFiltrarArticulo.proveedor_id !== ''" v-slot:append>
          <q-icon name="cancel"
            @click.stop.prevent="formFiltrarArticulo.proveedor_id = ''" class="cursor-pointer" />
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No hay resultados
            </q-item-section>
          </q-item>
        </template>
    </q-select>

    <q-btn round color="black" icon="search" class="q-ml-md" @click="contarArticulos" />
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import Api from "../../../apis/Api"
import useHelpers from "../../../composables/useHelpers";

export default defineComponent({
  name: 'FiltrarArticulo',
  props: ['pagination'],
  setup(props,  { emit }) {

    const formFiltrarArticulo = ref({
      desde: '',
      hasta: '',
      proveedor_id: ''
    })
    const listProveedores = ref([]);
    const { mostrarNotify } = useHelpers();

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

    const contarArticulos = async() => {
      formFiltrarArticulo.value.page        = (props.pagination.page - 1) * props.pagination.rowsPerPage;
      formFiltrarArticulo.value.rowsPerPage = props.pagination.rowsPerPage;

      if ( formFiltrarArticulo.value.desde != '' && formFiltrarArticulo.value.hasta == '' )
      return mostrarNotify('warning', 'Completa los campos de fecha de busqueda');

      if ( formFiltrarArticulo.value.desde == '' && formFiltrarArticulo.value.hasta != '' )
      return mostrarNotify('warning', 'Completa los campos de fecha de busqueda');

      if ( formFiltrarArticulo.value.desde > formFiltrarArticulo.value.hasta )
        return mostrarNotify('warning', 'Error en el rango de fecha de busqueda');

      const { data } = await Api.post('/articulos/contarArticulos', formFiltrarArticulo.value);
      data.desde        = formFiltrarArticulo.value.desde
      data.hasta        = formFiltrarArticulo.value.hasta
      data.proveedor_id = formFiltrarArticulo.value.proveedor_id

      emit('actualizarLista', data);
    }

    getProveedores();

    return {
      contarArticulos,
      formFiltrarArticulo,
      listProveedores
    }
  }
})
</script>

