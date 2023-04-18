<template>
  <q-page>
    <div class="row q-py-lg q-pl-md">
      <div class="col-md-6">
        <label class="text-h6">Puntos de Ventas</label>
      </div>
      <div class="col-md-6 flex justify-end">
        <q-btn color="secondary" v-if="validarPermisos('Agregar PV')"
        icon-right="add_circle" label="Agregar Punto de Venta" class="q-mr-md"
        @click="modalAgregarPV = !modalAgregarPV"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="q-pa-md">
          <q-table
            class="my-sticky-header-table"
            :rows="rows"
            :columns="columns"
            :loading="loading"
            :filter="filter"
            row-key="name">

            <template v-slot:top>
              <q-space />
              <q-input dense debounce="300" color="primary" v-model="filter">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:body-cell-id="props">
              <q-td :props="props">
                {{ props.pageIndex + 1 }}
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <template v-if="props.value">
                  <q-badge outline color="positive" label="Activo" class="q-pa-sm" />
                </template>
                <template v-else>
                  <q-badge outline color="red" label="Inactivo" class="q-pa-sm" />
                </template>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="primary"
                v-if="validarPermisos('Editar PV')"
                @click="editarProveedor(props.row)"
                icon="edit"
                class="q-mr-sm"
                size="11px" />

                <template v-if="props.row.estado">
                  <q-btn round color="blue-grey"
                  icon="close"
                  @click="activarDesactivarPV(props.row.id, false)"
                  size="11px" />
                </template>

                <template v-else>
                  <q-btn round color="positive"
                  class="q-mr-sm"
                  icon="done"
                  @click="activarDesactivarPV(props.row.id, true)"
                  size="11px" />

                  <q-btn round color="deep-orange"
                  icon="delete"
                  @click="eliminarPV(props.row.id)"
                  size="11px" />
                </template>

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

  <q-dialog v-model="modalAgregarPV">
    <Add @actualizarLista="getPV" />
  </q-dialog>

  <q-dialog v-model="modalEditarPV">
    <Editar :pvData="pvData" @actualizarLista="getPV" />
  </q-dialog>

</template>

<script>
import { defineComponent, ref } from 'vue'
import Api from "../../../apis/Api"
import useRolPermisos from "../../../composables/useRolPermisos";
import useHelpers from "../../../composables/useHelpers";
import { Loading, Dialog } from 'quasar'
import Add from './Add.vue'
import Editar from './Editar.vue'
const columns = [
  { name: 'id', label: '#', align: 'left', field: 'id', sortable: true },
  { name: 'nombre', align: 'center', label: 'NOMBRE', field: 'nombre', sortable: true },
  { name: 'punto_emision', align: 'center', label: 'PUNTO DE EMISION', field: 'punto_emision' },
  { name: 'direccion', align: 'center', label: 'DIRECCION', field: 'direccion' },
  { name: 'acciones', label: 'ACCIONES', align: 'center' }
]

export default defineComponent({
  name: 'IndexPV',
  components: { Add, Editar },
  setup () {
    const { validarPermisos } = useRolPermisos();
    const filter = ref('')
    const rows = ref([]);
    const modalAgregarPV = ref(false);
    const modalEditarPV = ref(false);
    const loading = ref( false );
    const pvData = ref({});
    const { mostrarNotify } = useHelpers();

    const getPV = async () => {
      //ocultar modales
      modalAgregarPV.value = false
      modalEditarPV.value = false
      loading.value = true;
      try {
        const { data: { puntos_ventas } } = await Api.get('/puntos_ventas');
        rows.value = puntos_ventas;
      } catch (error) {
        alert(error)
      }
      loading.value = false;
    }

    const activarDesactivarPV = async (pv_id, estado) => {
      try {
        await Api.delete(`/puntos_ventas/${ pv_id }/${ estado }`)
        mostrarNotify('positive', 'Punto de Venta actualizado exitosamente');
        getPV();
      } catch (error) {
        alert(error);
      }
    }

    const eliminarPV = async (pv_id) => {
      Dialog.create({
        title: '¿Deseas Eliminar este punto de venta?',
        message: 'Una vez eliminado no podra recuperarse...!',
        ok: { push: true, label:'Eliminar', color: 'teal-7' },
        cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
      }).onOk(async () => {
          try {
            await Api.delete(`/puntos_ventas/${ pv_id }`)
            mostrarNotify('positive', 'Punto de Venta eliminado exitosamente');
            getPV();
          }catch(error) {
            mostrarNotify('negative', error.response.data.message);
          }
        })
    }


    const editarProveedor = ( proveedor ) =>{
      pvData.value = proveedor;
      modalEditarPV.value = true;
    }

    getPV();

    return {
      editarProveedor,
      eliminarPV,
      modalAgregarPV,
      modalEditarPV,
      activarDesactivarPV,
      columns,
      loading,
      filter,
      getPV,
      isPwd: ref(true),
      rows,
      pvData,
      validarPermisos
    }
  }
})
</script>
<style>
.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #ddebdc; }

.my-sticky-header-table tbody tr:nth-child(even) {
    background-color: rgb(240, 240, 240);
}
</style>
