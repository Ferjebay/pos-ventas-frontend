<template>
  <div class="col-md-9 flex items-center">
    <label>Filtrar Por:</label>

    <q-input class="q-ml-md" style="width: 20%"
      filled v-model="formFiltrarVentas.desde" dense
      mask="date" clearable clear-icon="close">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="formFiltrarVentas.desde" :locale="myLocale">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
    </q-input>

    <label class="q-mx-md">HASTA:</label>

    <q-input filled style="width: 20%"
      v-model="formFiltrarVentas.hasta" dense
      mask="date" clearable clear-icon="close">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="formFiltrarVentas.hasta" :locale="myLocale">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
    </q-input>

    <q-select v-if="user.rol_name == 'ADMINISTRADOR' || user.rol_name == 'SUPER-ADMINISTRADOR'"
      filled required dense emit-value map-options style="width: 29%;margin-left: 27px;"
        v-model="formFiltrarVentas.pv_id" :options="listPV">
        <template v-if="formFiltrarVentas.pv_id !== ''" v-slot:append>
          <q-icon name="cancel"
            @click.stop.prevent="formFiltrarVentas.pv_id = ''" class="cursor-pointer" />
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
      class="q-ml-md" @click="filtarVentas" />
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Api from "../../../apis/Api"
import useHelpers from "../../../composables/useHelpers";
import { Loading } from 'quasar'

export default defineComponent({
  name: 'FiltrarVentas',
  props: ['user'],
  setup(props,  { emit }) {

    const formFiltrarVentas = ref({
      desde: '',
      hasta: '',
      pv_id: ''
    })

    const listPV = ref([]);
    const loading = ref( false );
    const { mostrarNotify } = useHelpers();

    const getPV = async () => {
      try {
        const { data: { pv } } = await Api.get('/ventas/getPV');
        listPV.value = [];

        pv.forEach(punto => {
          listPV.value.push({ label: punto.nombre, value: punto.id })
        });

      } catch (error) {
        alert(error)
      }
    }

    const filtarVentas = async() => {
      if ( formFiltrarVentas.value.desde != '' && formFiltrarVentas.value.hasta == '' )
      return mostrarNotify('warning', 'Completa los campos de fecha de busqueda');

      if ( formFiltrarVentas.value.desde == '' && formFiltrarVentas.value.hasta != '' )
      return mostrarNotify('warning', 'Completa los campos de fecha de busqueda');

      if ( formFiltrarVentas.value.desde > formFiltrarVentas.value.hasta )
        return mostrarNotify('warning', 'Error en el rango de fecha de busqueda');

      if (props.user.rol_name == 'INDEPENDIENTE' )
        formFiltrarVentas.value.pv_id = props.user.pv_id

      if ((props.user.rol_name == 'SUPER-ADMINISTRADOR' || props.user.rol_name == 'ADMINISTRADOR') &&
      formFiltrarVentas.value.desde == '' && formFiltrarVentas.value.hasta == '' && formFiltrarVentas.value.pv_id == ''){
        let data = { facturas: [] }
        return emit('actualizarLista', data);
      }

      loading.value = true;
      try {
        const { data } = await Api.post('/ventas/consulta', formFiltrarVentas.value);
        emit('actualizarLista', data);

      } catch (error) {
        console.log(error);
      }
      loading.value = false;
    }

    getPV();

    return {
      listPV,
      loading,
      filtarVentas,
      formFiltrarVentas,
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

