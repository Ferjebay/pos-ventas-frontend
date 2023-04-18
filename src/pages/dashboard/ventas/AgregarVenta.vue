<template>
  <q-page>
    <div class="row q-my-lg q-pl-md">
      <div class="col-md-6">
        <label class="text-h5 text-weight-medium">Fecha de Emisión:
          <span class="text-weight-regular">{{fechaActual }}</span>
        </label>
      </div>
      <div class="col-md-6 text-right">
        <label class="q-mr-lg text-h5 text-weight-medium">
          <span class="q-mr-sm">N° Factura:</span>
          <q-spinner-facebook v-if="numFacturaCargado"
            color="primary" class="q-ml-md" size="2em" />
          <span v-else class="text-weight-regular">
            {{ formVenta.numComprobante }}
          </span>
        </label>
      </div>

      <div class="col-md-5 q-mt-lg">
        <label>Seleccionar Cliente:</label>
        <q-select color="orange" filled v-model="formVenta.cliente_id"
          :options="listClientes" emit-value map-options
          @filter="filterFn" use-input input-debounce="0">
          <template v-if="formVenta.cliente_id && formVenta.cliente_id !== 'CONSUMIDOR FINAL'" v-slot:append>
            <q-icon name="cancel"
              @click.stop.prevent="formVenta.cliente_id = 'CONSUMIDOR FINAL'" class="cursor-pointer" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay resultados
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-md-4 q-mt-lg btnAddCliente">
        <q-btn round color="secondary"
          @click="modalAgregarCliente = true"
          icon="person_add" />
      </div>
    </div>

    <div class="row q-my-lg q-pl-md">
      <div class="col-md-5">
        <label>Filtrar por código IMEI:</label>
        <q-input outlined bottom-slots :loading="loadingState"
          v-model.trim="filterByIMEI" @keyup.enter="filterArticulo">
          <template v-slot:append>
            <q-icon v-if="filterByIMEI !== ''" name="close" @click="filterByIMEI = ''"
            class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-form @submit="onSubmit">
      <div class="row" >
        <div class="col-md-12">
          <div class="q-pa-md">

            <q-table :rows="rows" :columns="columns" row-key="name" >

              <template v-slot:no-data="{  }">
                <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                  <span class="text-subtitle1">
                    Agrega algún Producto
                  </span>
                  <q-icon size="2em" name="playlist_add" />
                </div>
              </template>

              <template v-slot:body-cell-precio_base="props">
                <q-td :props="props">
                  ${{  props.row.precio_base.toFixed(2)  }}
                </q-td>
              </template>

              <template v-slot:body-cell-detalle="props">
                <q-td :props="props">
                  <q-input input-class="text-center" dense
                  v-model.trim="props.row.detalle" />
                </q-td>
              </template>

              <template v-slot:body-cell-precio_venta="props">
                <q-td :props="props">
                  <q-input input-class="text-center" dense required min="1" step="0.01"
                  type="number" style="width: 100px;"
                  v-model.trim="props.row.precio_venta" @change="cambiarEstadoIngreso( props.row )" />
                </q-td>
              </template>

              <template v-slot:body-cell-estado_ingreso="props">
                <q-td :props="props">
                  <label :class=" props.row.estado_ingreso > 0 ? 'text-subtitle1 text-positive text-weight-medium' : 'text-subtitle1 text-negative text-weight-medium'">
                    ${{ props.row.estado_ingreso }}
                  </label>
                </q-td>
              </template>

              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn round color="deep-orange"
                  @click="quitarArticulo(props.row.id)"
                  icon="close" size="8px" />
                </q-td>
              </template>

            </q-table>

          </div>
        </div>
        <div class="col-md-12" style="display: flex;justify-content: end;">
          <table style="margin-right: 30px;">
            <tr class="text-right">
              <td><b>SUBTOTAL:</b></td>
              <td style="width: 90px;" class="text-subtitle1 text-weight-regular">$0.00</td>
            </tr>
            <tr class="text-right">
              <td class="q-py-sm"><b>IVA(12%):</b></td>
              <td style="width: 90px;" class="q-py-sm text-subtitle1 text-weight-regular">$0.00</td>
            </tr>
            <tr class="text-right">
              <td><b>TOTAL A PAGAR:</b></td>
              <td style="width: 90px;">
                <q-badge outline class="text-subtitle1 text-weight-bold"
                    color="secondary" :label=" `$${totalPago}` " />
              </td>
            </tr>
          </table>
          <!-- <span><b>Total:</b> $567.23 </span> -->
        </div>
        <div class="col-md-4 offset-4">
          <q-btn square color="positive" type="submit" label="Agregar Venta"
            class="full-width" icon="shopping_cart" />
        </div>
      </div>
    </q-form>
  </q-page>

  <!-- AGREGAR UN NUEVO CLIENTE -->
  <q-dialog v-model="modalAgregarCliente">
    <Add @actualizarLista="getClientes" />
  </q-dialog>

</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import Api from "../../../apis/Api"
import { useRouter } from "vue-router";
import JWT from 'jwt-client'
import { useAuthUserStore } from "stores/auth-user"
import useHelpers from "../../../composables/useHelpers";
import { date, useQuasar } from 'quasar'
import Add from '../clientes/Add.vue'

const columns = [
  { name: 'acciones', label: 'Quitar', align: 'left'  },
  { name: 'marca', label: 'Marca', align: 'left', field: 'marca' },
  { name: 'modelo', label: 'Modelo', align: 'left', field: 'modelo' },
  { name: 'imei', label: 'IMEI', align: 'left', field: 'imei' },
  { name: 'detalle', label: 'Detalles', align: 'center' },
  { name: 'estado_ingreso', label: 'Estado de Ingreso', align: 'center' },
  { name: 'precio_base', label: 'Precio Base', align: 'left', field: 'precio_base' },
  { name: 'precio_venta', label: 'Precio Venta', align: 'left' },
]
let optionsClients = []

export default defineComponent({
  name: 'AddVentas',
  components: { Add },
  setup () {
    const rows = ref([]);
    const listClientes = ref([]);
    const modalAgregarCliente = ref(false);
    const numFacturaCargado = ref( false );
    const loadingState = ref(false)
    const { mostrarNotify } = useHelpers();
    const $q = useQuasar();
    let fechaActual = '';

    const formVenta = ref({
      cliente_id: 'CONSUMIDOR FINAL',
      numComprobante: '',
    });
    const filterByIMEI = ref('');

    const timeStamp   = Date.now()
    fechaActual = date.formatDate(timeStamp, 'DD/MM/YYYY')

    const router = useRouter();
    const authUserStore = useAuthUserStore();

    const { claim: { user } } = JWT.read(authUserStore.token);

    const filterArticulo = async () => {
      if( filterByIMEI.value.length == 0 ) return alert("ingresa el codigo imei")

      try {
        loadingState.value = true
        const { data } = await Api.get(`/articulos/${ filterByIMEI.value }`);

        //Verificar si se encontro el articulo
        if ( data.articulo.length == 0 ) {
          loadingState.value = false
          return mostrarNotify('warning', 'No se encontro el articulo...');
        }
        if ( data.articulo[0].estado == 0 ){
          loadingState.value = false
          return mostrarNotify('warning', 'El articulo ya se vendio');
        }

        //Verificar si ya se agrego este articulo
        const resultado = rows.value.some( row => row.imei == data.articulo[0].imei )
        if ( !resultado ){
          data.articulo[0].detalle = ''
          data.articulo[0].precio_venta = 0
          data.articulo[0].estado_ingreso = 0
          rows.value.unshift(data.articulo[0]);
          filterByIMEI.value = ''
        }
        else mostrarNotify('warning', 'Ya fue agregado este articulo');
        loadingState.value = false
      } catch (error) {
        console.log(error)
        loadingState.value = false
      }
    }

    const cambiarEstadoIngreso = ( fila ) => {
      let diferencia = parseFloat( fila.precio_venta ) - parseFloat(fila.precio_base.toFixed(2));

      const index = rows.value.findIndex( row => row.imei == fila.imei )
      rows.value[ index ].estado_ingreso = diferencia.toFixed(2);
    }

    const quitarArticulo = ( articulo_id ) => {
      const indice = rows.value.findIndex( row => row.id == articulo_id )
      rows.value.splice(indice, 1);
    }

    const getNoFactura = async () => {
      numFacturaCargado.value = true
      try {
        const { data: { numeroSecuencial } } = await Api.get('/ventas/getNoFactura');
        formVenta.value.numComprobante = `001-${ user.punto_emision }-${ numeroSecuencial }`
      } catch (error) {
        alert(error)
      }
      numFacturaCargado.value = false
    }

    const getClientes = async () => {
      //Cerrar modal de agregar cliente
      modalAgregarCliente.value = false;
      try {
        const { data: { clientes } } = await Api.get('/clientes');

        listClientes.value = [];

        clientes.forEach(cliente => {
          if ( cliente.nombres != 'CONSUMIDOR FINAL' ) {
            listClientes.value.push({
              label: cliente.nombres,
              value: cliente.id,
              cedula: cliente.num_documento
            })
          }
        });

        listClientes.value.push({ label: 'CONSUMIDOR FINAL', value: 0, cedula: '0' });
        optionsClients = listClientes.value;
      } catch (error) {
        alert(error)
      }
    }

    const totalPago = computed(() => {
      let sumaTotal = 0;
      rows.value.forEach( row =>  sumaTotal += parseFloat(row.precio_venta) )
      return sumaTotal.toFixed(2)
    })

    const onSubmit = async () => {
      if (rows.value.length == 0) return mostrarNotify('warning', 'Debes agregar algun producto..');

      formVenta.value.usuario_id = user.id
      formVenta.value.pv_id = user.pv_id
      formVenta.value.detalle = rows.value
      formVenta.value.subTotal = '0.00'
      formVenta.value.iva = '0.00'
      formVenta.value.totalPago = totalPago.value

      try {
        $q.dialog({
          title: '¿Deseas Agregar esta Venta?',
          ok: { push: true, label: 'Agregar' },
          cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
        }).onOk(async () => {
          $q.loading.show({message: 'Cargando...'});

          await Api.post('/ventas/add', formVenta.value)

          $q.loading.hide();

          mostrarNotify('positive', 'Venta realizado exitosamente');

          router.push('/ventas');
        })
      } catch (error) {
        alert(error);
        $q.loading.hide();
      }
    }

    getNoFactura();
    getClientes();

    return {
      cambiarEstadoIngreso,
      columns,
      formVenta,
      fechaActual,
      filterByIMEI,
      filterArticulo,
      listClientes,
      loadingState,
      getClientes,
      modalAgregarCliente,
      numFacturaCargado,
      rows,
      router,
      filterFn (val, update) {
        if (val === '') {
          update(() => { listClientes.value = optionsClients })
          return
        }
        update(() => {
          const needle = val.toLowerCase()
          listClientes.value = listClientes.value.filter(v =>
            v.cedula.indexOf(needle) > -1 || v.label.toLowerCase().indexOf(needle) > -1
          )
        })
      },
      onSubmit,
      totalPago,
      quitarArticulo
    }
  }
})
</script>

<style scoped>

#labelNV{
  font-size: 25px;
  font-weight: 500;
  margin-left: 10px;
}

.btnAddCliente{
  margin-top: 48px;
  margin-left: 20px;
}
</style>
