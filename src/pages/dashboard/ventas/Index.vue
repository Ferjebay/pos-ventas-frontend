<template>
  <q-page>
    <div class="row q-my-lg q-pl-md">

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
            :rows="rows"
            :columns="columns"
            :loading = "loading"
            row-key="name">

            <template v-slot:top>
              <label class="q-mr-xl text-h5 text-weight-regular">Listado de Ventas</label>

                <label class="q-ml-xl text-subtitle1">
                  <b>TOTAL DE VENTAS:</b>
                  <q-badge outline class="q-px-md text-subtitle1 q-ml-sm text-weight-bold"
                    color="positive" :label=" `$${totalVentas}` " />
                </label>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props" class="text-h6">${{  props.row.totalPago  }}</q-td>
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
import { defineComponent, ref } from 'vue'
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
        const { data } = await Api.post('/ventas/consulta', {pv_id: user.pv_id});

        data.facturas.map( factura => {
          if (factura.estado) totalVentas.value += factura.totalPago

          const dateArray = factura.fecha.split('T')[0].split('-');
          factura.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }`

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
      rows.value = data.facturas;
      data.facturas.map( factura => {

          if (factura.estado) totalVentas.value += factura.totalPago

          const dateArray = factura.fecha.split('T')[0].split('-');
          factura.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }`
      })
    }

    getVentas();

    return {
      actualizarLista,
      anularFactura,
      columns,
      mostrarDetalleFactura,
      modalDetalleFactura,
      loading,
      facturaData,
      rows,
      router,
      totalVentas,
      validarPermisos,
      user
    }
  }
})
</script>
