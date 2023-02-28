<template>
  <q-page>
    <div class="row q-my-lg q-pl-md">
      <FiltrarArticulos :pagination="pagination" @actualizarLista="actualizarLista" />

      <div class="col-md-2 flex justify-end">
        <q-btn color="secondary" icon-right="add_circle" class="q-mr-md"
        label="Nuevo" @click="modalAgregarArticulo = true"
        v-if="validarPermisos('Agregar Articulo')"/>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="q-pa-md">
          <q-table
            ref="tableRef"
            :rows="rows"
            :columns="columns"
            :filter="filter"
            row-key="id"
            v-model:pagination="pagination"
            :loading="loading"
            :rows-per-page-options="[3, 5, 15, 0]"
            binary-state-sort
            @request="onRequest">
            <template v-slot:top>
              <label class="q-mr-xl text-h6 text-weight-regular">Listado de Productos</label>

                <label v-show="stockArticulos != ''" class="q-ml-xl text-subtitle1">
                  <b>INGRESOS:</b> {{ stockArticulos.total }}
                </label>
                <label v-show="stockArticulos != ''" class="q-mx-xl text-subtitle1">
                  <b>VENDIDOS:</b> {{ stockArticulos.vendidos }}
                </label>
                <label v-show="stockArticulos != ''" class="text-subtitle1">
                  <b>STOCK:</b> {{ stockArticulos.en_stock }}
                </label>

              <q-space />
              <q-input dense debounce="1000" color="primary" v-model="filter">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="id" :props="props">{{  props.pageIndex + 1  }}</q-td>
                <q-td key="marca" :props="props"> {{ props.row.marca }} </q-td>
                <q-td key="modelo" :props="props"> {{ props.row.modelo }} </q-td>
                <q-td key="proveedor_id" :props="props">{{ props.row.razon_social }}</q-td>
                <q-td key="imei" :props="props">{{ props.row.imei }}</q-td>
                <q-td key="color" :props="props">{{ (props.row.color == '') ? '---' : props.row.color }}</q-td>
                <q-td key="precio_base" :props="props">${{ props.row.precio_base.toFixed(2) }}</q-td>
                <q-td key="fecha_creacion" :props="props">
                  {{ props.row.fecha_creacion }}
                </q-td>
                <q-td key="estado" :props="props">
                  <q-badge outline class="q-py-xs q-px-md"
                    :color="( props.row.estado ) ? 'positive' : 'dark'">
                     <span v-if="props.row.estado"> En Stock </span>
                     <span v-else>
                        Vendido
                        <br>
                        {{ props.row.fecha_venta }}
                      </span>
                  </q-badge>
                </q-td>
                <q-td key="acciones" :props="props">
                  <q-btn round color="blue-grey"
                  v-if="validarPermisos('Editar Articulo') && props.row.estado"
                  icon="edit"
                  class="q-mr-sm"
                  @click="editarArticulo(props.row)"
                  size="10px" />

                  <q-btn round color="blue-grey"
                  v-if="validarPermisos('Eliminar Articulo') && props.row.estado"
                  icon="close"
                  @click="eliminarArticulo(props.row.id)"
                  size="10px" />
                </q-td>
              </q-tr>
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

  <q-dialog v-model="modalAgregarArticulo" persistent>
    <AgregarArticulo @actualizarLista="getArticulos" />
  </q-dialog>

  <q-dialog v-model="modalEditarArticulo">
    <EditarArticulo :articuloData="articuloData" @actualizarLista="getArticulos" />
  </q-dialog>

</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import Api from "../../../apis/Api"
import FiltrarArticulos from './FiltrarArticulos.vue'
import AgregarArticulo from './AgregarArticulo.vue'
import EditarArticulo from './EditarArticulo.vue'
import { date, useQuasar } from 'quasar'
import useRolPermisos from "../../../composables/useRolPermisos";

const columns = [
  { name: 'id', label: '#', align: 'left', field: 'id', sortable: true },
  { name: 'marca', label: 'Marca', align: 'center', field: 'marca' },
  { name: 'modelo', label: 'Modelo', align: 'center', field: 'modelo' },
  { name: 'proveedor_id', label: 'Proveedor', align: 'center', field: 'razon_social' },
  { name: 'imei', label: 'IMEI', align: 'center', field: 'imei' },
  { name: 'color', label: 'Color', align: 'center', field: 'color' },
  { name: 'precio_base', label: 'Precio Base', align: 'center', field: 'precio_base' },
  { name: 'fecha_creacion', label: 'Fecha Creación', align: 'center', field: 'fecha_creacion' },
  { name: 'estado', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'acciones', align: 'center' }
]

export default defineComponent({
  name: 'IndexArticulo',
  components: { AgregarArticulo, EditarArticulo, FiltrarArticulos },
  setup () {
    const { validarPermisos } = useRolPermisos();
    const articuloData = ref(null);

    const modalFiltrarArticulo = ref( false );
    const modalAgregarArticulo = ref( false );
    const modalEditarArticulo  = ref( false );
    const stockArticulos       = ref ( '' );

    const router = useRouter();
    const $q = useQuasar();

    const originalRows = ref([]);
    const rows = ref([]);
    const filter = ref('');
    const tableRef = ref();
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 3,
      rowsNumber: 10
    })

    const actualizarLista = ( filas ) => {
      getArticulos( 0, pagination.rowsPerPage, filas )
    }

    const eliminarArticulo = async ( articulo_id ) => {
      try {
        $q.dialog({
          title: 'Deseas Eliminar este articulo?',
          message: 'Una vez eliminado no podra recuperarse...!',
          ok: { push: true, label:'Eliminar', color: 'teal-7' },
          cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
        }).onOk(async () => {
          await Api.delete(`/articulos/${ articulo_id }`)
          getArticulos();
          $q.notify({
            color: 'positive',
            message: 'Articulo Eliminado Exitosamente',
            icon: 'done',
            position: 'top-right'
          })
        })
      } catch (error) {
        alert(error);
      }
    }

    const editarArticulo = async ( articulo ) => {
      articuloData.value = articulo;
      modalEditarArticulo.value = true;
    }

    const getArticulos = async (page, rowsPerPage, filtro = null) => {
        modalAgregarArticulo.value = false;
        modalEditarArticulo.value = false;
        let busqueda = 0;

        if (filter.value == '') busqueda = 'sin-busqueda';
        else busqueda = filter.value

        try {
          if ( filtro == null )
            var { data: { articulos } } = await Api.get(`/articulos/${page}/${rowsPerPage}/${busqueda}`);
          else{
            console.log( filtro );
            var articulos = filtro.articulos;
            stockArticulos.value = filtro.articulosContados[0];
            if (filtro.articulos.length == 0){
              pagination.value.rowsNumber = 0;
            }else{
              pagination.value.rowsNumber = filtro.articulos[0].totalArticulos;
            }
          }

          articulos.map( articulo => {
            let dateArray = articulo.fecha_creacion.split('T')[0].split('-');
            articulo.fecha_creacion = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }`

            if (articulo.estado == '0') {
              let dateArray = articulo.fecha_venta.split('T')[0].split('-');
              articulo.fecha_venta = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }`
            }
          })

          rows.value = articulos;
        } catch (error) {
          alert(error)
        }
    }

    async function onRequest (props) {

      const { page, rowsPerPage, sortBy, descending } = props.pagination

      loading.value = true

      const startRow = (page - 1) * rowsPerPage
      await getArticulos(startRow, rowsPerPage);

      // update rowsCount with appropriate value
      if (rows.value.length != 0) pagination.value.rowsNumber = rows.value[0].totalArticulos;
      else pagination.value.rowsNumber = 0

      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending

      loading.value = false
    }

    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })

    return {
      articuloData,
      actualizarLista,
      columns,
      date,
      editarArticulo,
      eliminarArticulo,
      getArticulos,
      filter,
      modalAgregarArticulo,
      modalEditarArticulo,
      modalFiltrarArticulo,
      loading,
      originalRows,
      router,
      rows,
      tableRef,
      onRequest,
      pagination,
      stockArticulos,
      validarPermisos
    }
  }
})
</script>
