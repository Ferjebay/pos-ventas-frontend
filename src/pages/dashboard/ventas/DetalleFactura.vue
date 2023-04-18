<template>
  <q-card style="width: 840px; max-width: 80vw;">
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
                    color="secondary" :label=" `$${ facturaData.totalPago.toFixed(2) }` " />
        </div>

        <div class="col-sm-12 q-my-sm">
          <q-table
            class="my-sticky-header-table2"
            :rows="rows"
            :columns="columns"
            :loading = "loading"
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

            <template v-slot:body-cell-precio_base="props">
              <q-td :props="props">
                ${{  props.row.precio_base.toFixed(2) }}
              </q-td>
            </template>

            <template v-slot:body-cell-estadoVenta="props">
              <q-td :props="props" class="estadoVenta"
                :class="( props.row.estadoVenta > 0 ) ? 'text-green-8': 'text-negative' ">
                ${{  props.row.estadoVenta.toFixed(2)  }}
              </q-td>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props">${{  props.row.total.toFixed(2) }}</q-td>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
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

const columns = [
  { name: 'indice', label: '#', sortable: true },
  { name: 'marca', align: 'center', label: 'MARCA', field: 'marca' },
  { name: 'modelo', label: 'MODELO', field: 'modelo', align: 'center'},
  { name: 'imei', label: 'IMEI', field: 'imei',  align: 'center' },
  { name: 'detalle', label: 'DETALLE', field: 'detalle',  align: 'center' },
  { name: 'precio_base', label: 'PRECIO BASE', align: 'center', field: 'precio_base' },
  { name: 'estadoVenta', label: 'ESTADO DE VENTA', align: 'center', field: 'estadoVenta' },
  { name: 'total', label: 'TOTAL', align: 'center', field: 'total' }
]

export default defineComponent({
  name: 'detalleFactura',
  props: ['facturaData'],
  setup(props) {
    const rows = ref([]);
    const loading = ref(false)
    const getDetalleVenta = async () => {
      try {
        loading.value = true;
        const { data } = await Api.get(`/ventas/${ props.facturaData.id }`);
        rows.value = data.detalleVenta;
        loading.value = false;
      } catch (error) {
        loading.value = false;
        alert(error)
      }
    }

    getDetalleVenta();

    return {
      columns,
      loading,
      rows
    }
  }
})
</script>

<style>
.my-sticky-header-table2 .q-table__top,
.my-sticky-header-table2 .q-table__bottom,
.my-sticky-header-table2 thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #737873;
  color: rgb(245, 241, 241);
}

.my-sticky-header-table2 tbody tr:nth-child(even) {
    background-color: rgb(240, 240, 240);
}
</style>
