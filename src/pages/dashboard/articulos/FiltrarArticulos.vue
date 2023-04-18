<template>
  <div class="col-md-10 flex items-center">

    <q-input class="q-ml-md" style="width: 20%"
      filled v-model="formFiltrarArticulo.desde" dense
      mask="date" clearable clear-icon="close">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="formFiltrarArticulo.desde" :locale="myLocale">
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
                <q-date v-model="formFiltrarArticulo.hasta" :locale="myLocale">
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

    <q-btn round color="black" icon="search" :loading="loading"
      class="q-ml-md" @click="contarArticulos" />
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import Api from "../../../apis/Api"
import useHelpers from "../../../composables/useHelpers";

export default defineComponent({
  name: 'FiltrarArticulo',
  props: ['pagination', 'formFiltrarArticulo'],
  setup(props,  { emit }) {
    const loading = ref( false );
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
      props.formFiltrarArticulo.page        = (props.pagination.page - 1) * props.pagination.rowsPerPage;
      props.formFiltrarArticulo.rowsPerPage = props.pagination.rowsPerPage;

      if ( props.formFiltrarArticulo.desde != '' && props.formFiltrarArticulo.hasta == '' )
      return mostrarNotify('warning', 'Completa los campos de fecha de busqueda');

      if ( props.formFiltrarArticulo.desde == '' && props.formFiltrarArticulo.hasta != '' )
      return mostrarNotify('warning', 'Completa los campos de fecha de busqueda');

      if ( props.formFiltrarArticulo.desde > props.formFiltrarArticulo.hasta )
        return mostrarNotify('warning', 'Error en el rango de fecha de busqueda');

      loading.value = true;

      const { data } = await Api.post('/articulos/contarArticulos', props.formFiltrarArticulo);
      data.desde        = props.formFiltrarArticulo.desde
      data.hasta        = props.formFiltrarArticulo.hasta
      data.proveedor_id = props.formFiltrarArticulo.proveedor_id
      loading.value = false;

      emit('actualizarLista', data);
    }

    getProveedores();

    return {
      contarArticulos,
      listProveedores,
      loading,
      myLocale: {
        /* starting with Sunday */
        days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
        daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
        firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
        format24h: true,
        pluralDay: 'dias'
      }
    }
  }
})
</script>

