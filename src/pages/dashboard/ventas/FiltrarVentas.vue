<template>
  <div class="col-md-9 flex items-center">
    <label>Filtrar Por:</label>

    <q-input class="q-ml-md" style="width: 20%"
      filled v-model="formFiltrarVentas.desde" dense
      mask="date" clearable clear-icon="close">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="formFiltrarVentas.desde">
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
      v-model="formFiltrarVentas.hasta" dense
      mask="date" clearable clear-icon="close">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="formFiltrarVentas.hasta">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
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

    <q-btn round color="black" icon="search" class="q-ml-md" @click="filtarVentas" />
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

      Loading.show({message: 'Cargando...'});
      try {
        const { data } = await Api.post('/ventas/consulta', formFiltrarVentas.value);
        emit('actualizarLista', data);

      } catch (error) {
        console.log(error);
      }
      Loading.hide()
    }

    getPV();

    return {
      listPV,
      filtarVentas,
      formFiltrarVentas
    }
  }
})
</script>

