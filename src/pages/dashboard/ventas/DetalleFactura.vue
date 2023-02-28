<template>
  <q-card style="width: 700px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">Detalle de la Factura</div>
    </q-card-section>

    <q-card-section>
      <div class="row q-gutter-sm justify-around">
        <div class="col-sm-4 text-right">
          <label class="text-subtitle1 text-weight-medium">Num. Comprobantes:</label>
        </div>
        <div class="col-sm-5 flex text-left">
          <label>{{ facturaData.num_comprobante }}</label>
        </div>
        <div class="col-sm-4 text-right">
          <label class="text-subtitle1 text-weight-medium">Punto de Venta:</label>
        </div>
        <div class="col-sm-5 flex text-left">
          <label>{{ facturaData.pv_nombre }}</label>
        </div>
        <div class="col-sm-4 text-right">
          <label class="text-subtitle1 text-weight-medium">Cliente:</label>
        </div>
        <div class="col-sm-5 flex text-left">
          <label>{{ facturaData.cliente }}</label>
        </div>
        <div class="col-sm-4 text-right">
          <label class="text-subtitle1 text-weight-medium">Usuario:</label>
        </div>
        <div class="col-sm-5 flex text-left">
          <label>{{ facturaData.usuario }}</label>
        </div>
        <div class="col-sm-4 text-right">
          <label class="text-subtitle1 text-weight-medium">Fecha:</label>
        </div>
        <div class="col-sm-5 flex text-left">
          <label>{{ facturaData.fecha }}</label>
        </div>
        <div class="col-sm-4 text-right">
          <label class="text-subtitle1 text-weight-medium">Total de Pago:</label>
        </div>
        <div class="col-sm-5 flex text-left">
          <q-badge outline class="text-subtitle1 text-weight-bold"
                    color="secondary" :label=" `$${ facturaData.totalPago }` " />
        </div>

        <div class="col-sm-12 q-my-sm">
          <q-table
            :rows="rows"
            :columns="columns"
            hide-bottom
            row-key="name">
            <template v-slot:body-cell-indice="props">
              <q-td :props="props">{{  props.pageIndex + 1 }}</q-td>
            </template>

            <template v-slot:body-cell-detalle="props">
              <q-td :props="props">
                {{  (props.row.detalle == '') ? 'Sin Detalle' : props.row.detalle }}
              </q-td>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props">${{  props.row.total }}</q-td>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Api from "../../../apis/Api"
import { useQuasar } from 'quasar'

const columns = [
  { name: 'indice', label: '#', sortable: true },
  { name: 'marca', align: 'center', label: 'Marca', field: 'marca' },
  { name: 'modelo', label: 'Modelo', field: 'modelo', align: 'center'},
  { name: 'imei', label: 'IMEI', field: 'imei',  align: 'center' },
  { name: 'detalle', label: 'Detalle', field: 'detalle',  align: 'center' },
  { name: 'total', label: 'Total', align: 'center', field: 'total' }
]

export default defineComponent({
  name: 'detalleFactura',
  props: ['facturaData'],
  setup(props) {
    const rows = ref([]);

    const getDetalleVenta = async () => {
      try {
        const { data } = await Api.get(`/ventas/${ props.facturaData.id }`);
        rows.value = data.detalleVenta;
      } catch (error) {
        alert(error)
      }
    }

    getDetalleVenta();

    return {
      columns,
      rows
    }
  }
})
</script>
