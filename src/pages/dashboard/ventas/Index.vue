<template>
  <q-page>
    <div class="row q-py-lg q-pl-md">

      <FiltrarVentas @actualizarLista = "actualizarLista" :user="user" />

      <div class="col-md-3 flex justify-end">
        <q-btn v-if="validarPermisos('Agregar Venta')"
          color="secondary" label="nueva Venta" class="q-mr-md"
          @click=" $router.push('/ventas/add')" />
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="q-pa-md">
          <q-table
            class="my-sticky-header-table"
            :rows="rows"
            :columns="columns"
            :loading = "loading"
            row-key="name">

            <template v-slot:top>
              <label class="q-mr-xl text-h5 text-weight-regular">Listado de Ventas</label>
                <label class="q-ml-xl text-subtitle1">
                  <b>TOTAL DE VENTAS:</b>
                  <q-badge outline class="q-px-md text-subtitle1 q-ml-sm text-weight-bold"
                    color="blue-grey" :label=" `$${ totalVentas.toFixed(2) }` " />
                </label>
                <label class="q-ml-lg text-subtitle1">
                  <b>GANANCIA:</b>
                  <q-badge outline class="q-px-md text-subtitle1 q-ml-sm text-weight-bold"
                    color="positive"
                    :label=" `$${ ( ganancias == null ) ? 0 : ganancias.toFixed(2) }` " />
                </label>
                <label class="q-ml-lg text-subtitle1">
                  <b>PERDIDA:</b>
                  <q-badge outline class="q-px-md text-subtitle1 q-ml-sm text-weight-bold"
                    color="red-9" :label=" `$${ ( perdidas == null) ? 0 : perdidas.toFixed(2) }` " />
                </label>

                <q-space />
                <q-input dense debounce="1000" color="primary" v-model="filter">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
            </template>

            <template v-slot:body-cell-estadoVenta="props">
              <q-td :props="props" class="estadoVenta"
                :class="( props.row.estadoVenta > 0 ) ? 'text-green-8': 'text-negative' ">
                ${{  ( props.row.estadoVenta !== null ) ?
                      parseFloat(props.row.estadoVenta).toFixed(2) :
                      0
                  }}
              </q-td>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props" class="totalVenta text-weight-regular">
                ${{  props.row.totalPago.toFixed(2)  }}
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge outline class="q-py-xs q-px-md"
                    :color="( props.row.estado ) ? 'secondary' : 'negative'"
                    :label=" props.row.estado ? 'Aceptado' : 'Anulado'" />
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="blue-grey"
                  icon="visibility"
                  @click="mostrarDetalleFactura( props.row )"
                  class="q-mr-sm"
                  size="10px" />

                <q-btn round color="blue-grey"
                  v-if="props.row.estado"
                  icon="close"
                  @click="anularFactura( props.row )"
                  size="10px" />
              </q-td>
            </template>

            <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span class="text-subtitle1">
                  No se encontró ningun Resultado
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>

  <q-dialog v-model="modalDetalleFactura">
    <DetalleFactura :facturaData="facturaData" />
  </q-dialog>

</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import Api from "../../../apis/Api"
import { useRouter } from "vue-router";
import useRolPermisos from "../../../composables/useRolPermisos";
import useHelpers from "../../../composables/useHelpers";
import { useQuasar } from 'quasar'
import DetalleFactura from './DetalleFactura.vue'
import FiltrarVentas from './FiltrarVentas.vue'
import { useAuthUserStore } from "stores/auth-user"
import JWT from 'jwt-client'

const columns = [
  { name: 'acciones', label: 'acciones', align: 'center' },
  { name: 'punto_venta', label: 'Punto de Venta', align: 'center', field: 'pv_nombre' },
  { name: 'num_comprobante', label: 'Num Comprobante', field: 'num_comprobante' },
  { name: 'usuario', label: 'Usuario', align: 'center', field: 'usuario' },
  { name: 'cliente', label: 'Cliente', align: 'center', field: 'cliente' },
  { name: 'fecha', label: 'Fecha/Hora', align: 'center', field: 'fecha' },
  { name: 'estadoVenta', label: 'Estado de Venta', align: 'center', field: 'estadoVenta' },
  { name: 'total', label: 'Total', field: 'totalPago' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
]

export default defineComponent({
  name: 'IndexVentas',
  components: { DetalleFactura, FiltrarVentas },
  setup () {
    const rows = ref([]);
    const router = useRouter();
    const modalDetalleFactura = ref(false);

    const totalVentas = ref( 0 );
    const ganancias = ref( 0 );
    const perdidas = ref( 0 );

    const filter = ref('');
    const facturaData = ref({})
    const { validarPermisos } = useRolPermisos();
    const { mostrarNotify } = useHelpers();
    const $q = useQuasar();
    const authUserStore = useAuthUserStore();
    const loading = ref( false )

    const { claim: { user } } = JWT.read(authUserStore.token);

    const getVentas = async () => {
      try {
        loading.value = true;
        const { data } = await Api.post('/ventas/consulta', { pv_id: user.pv_id, filter: filter.value });
        totalVentas.value = 0;
        ganancias.value   = (data.estadoVentas.ganancias == null) ? 0 : data.estadoVentas.ganancias;
        perdidas.value    = (data.estadoVentas.perdidas == null) ? 0 : data.estadoVentas.perdidas;

        data.facturas.map( factura => {
          if (factura.estado) totalVentas.value += factura.totalPago

          const dateArray = factura.fecha.split('T')[0].split('-');
          const timeArray = factura.hora.split(':');
          factura.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }  ${ timeArray[0] }:${ timeArray[1] } ${ (timeArray[0] < 12 ) ? 'am' : 'pm' }`
        })
        rows.value = data.facturas;
        loading.value = false;
      } catch (error) {
        alert(error)
        loading.value = false;
      }
    }

    const anularFactura = ( factura ) => {
      $q.dialog({
        title: '<center>¿Estas Seguro de anular esta Factura?</center>',
        message: `<span><strong>Num Comprobante</strong>: ${ factura.num_comprobante }</span> <br>
                <span class='q-my-lg'><strong>Cliente</strong>: ${ factura.cliente }</span> <br>
                <span class='q-my-lg'><strong>Fecha/Hora</strong>: ${ factura.fecha }</span> <br>
                <span><strong>Total</strong>: $${ factura.totalPago }</span> <br>`,
        html: true,
        ok: { push: true, label:'Anular', color: 'teal-7' },
        cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
      }).onOk(async () => {
        try {
          $q.loading.show({ message: 'Cargando...'})
          await Api.put(`/ventas/${ factura.id }`);
          mostrarNotify('positive', 'Factura Anulada exitosamente');
          getVentas();
          $q.loading.hide()
        }catch (error){
          console.log(error);
        }
      })
    }

    const mostrarDetalleFactura = ( factura ) => {
      modalDetalleFactura.value = true;
      facturaData.value = factura
    }

    const actualizarLista = ( data ) => {
      totalVentas.value = 0;
      ganancias.value   = (!data.estadoVentas) ?
        0 : data.estadoVentas.ganancias;
        perdidas.value  = (!data.estadoVentas) ?
        0 : data.estadoVentas.perdidas;
      rows.value = data.facturas;
      data.facturas.map( factura => {
          if (factura.estado) totalVentas.value += factura.totalPago

          const dateArray = factura.fecha.split('T')[0].split('-');
          const timeArray = factura.hora.split(':');
          factura.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }  ${ timeArray[0] }:${ timeArray[1] } ${ (timeArray[0] < 12 ) ? 'am' : 'pm' }`
          factura.estadoVenta = factura.estadoVenta.toFixed(2);
      })
    }

    getVentas();

    watch(filter, (newValue, oldValue) => {
      getVentas();
    })

    return {
      actualizarLista,
      anularFactura,
      columns,
      mostrarDetalleFactura,
      modalDetalleFactura,
      loading,
      ganancias,
      perdidas,
      facturaData,
      filter,
      rows,
      router,
      totalVentas,
      validarPermisos,
      user
    }
  }
})
</script>

<style scoped>
.estadoVenta{
  font-size: 14px;
}
.totalVenta{
  font-size: 15px;
}
.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #ddebdc; }

.my-sticky-header-table tbody tr:nth-child(even) {
    background-color: rgb(240, 240, 240);
}
</style>
