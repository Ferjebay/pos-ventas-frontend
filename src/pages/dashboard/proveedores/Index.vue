<template>
  <q-page>
    <div class="row q-py-lg q-pl-md">
      <div class="col-md-6">
        <label class="text-h6">Listado de Proveedores</label>
      </div>
      <div class="col-md-6 flex justify-end">
        <q-btn color="secondary" v-if="validarPermisos('Agregar Proveedor')"
        icon-right="person_add" label="Agregar Proveedor" class="q-mr-md"
        @click="modalAgregarProveedor = !modalAgregarProveedor"
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
            :filter="filter"
            :loading="loading"
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
                v-if="validarPermisos('Editar Proveedor')"
                @click="editarProveedor(props.row)"
                icon="edit"
                class="q-mr-sm"
                size="11px" />

                <q-btn round color="deep-orange"
                v-if="props.row.estado && validarPermisos('Inactivar Proveedor')"
                icon="close"
                @click="activarDesactivarProveedor(props.row.id, false)"
                size="11px" />

                <q-btn round color="positive"
                v-if="!props.row.estado && validarPermisos('Activar Proveedor')"
                icon="done"
                @click="activarDesactivarProveedor(props.row.id, true)"
                size="11px" />

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

  <q-dialog v-model="modalAgregarProveedor">
    <Add @actualizarLista="getProveedores" />
  </q-dialog>

  <q-dialog v-model="modalEditarProveedor">
    <Editar :proveedorData="proveedorData" @actualizarLista="getProveedores" />
  </q-dialog>

</template>

<script>
import { defineComponent, ref } from 'vue'
import Api from "../../../apis/Api"
import useRolPermisos from "../../../composables/useRolPermisos";
import useHelpers from "../../../composables/useHelpers";
import { Loading } from 'quasar'
import Add from './Add.vue'
import Editar from './Editar.vue'
const columns = [
  { name: 'id', label: '#', align: 'left', field: 'id', sortable: true },
  { name: 'razon_social', align: 'center', label: 'Razon Social', field: 'razon_social', sortable: true },
  { name: 'tipo_documento', align: 'center', label: 'Tipo de Documento', field: 'tipo_documento' },
  { name: 'numero_documento', align: 'center', label: 'Numero de Documento', field: 'numero_documento' },
  { name: 'email', label: 'Email', field: 'email', align: 'center'},
  { name: 'celular', label: 'Celular', field: 'celular',  align: 'center' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'acciones', label: 'acciones', align: 'center' }
]

export default defineComponent({
  name: 'IndexProveedor',
  components: { Add, Editar },
  setup () {
    const { validarPermisos } = useRolPermisos();
    const filter = ref('')
    const rows = ref([]);
    const modalAgregarProveedor = ref(false);
    const modalEditarProveedor = ref(false);
    const loading = ref( false );
    const proveedorData = ref({});
    const { mostrarNotify } = useHelpers();

    const getProveedores = async () => {
      //ocultar modales
      modalAgregarProveedor.value = false
      modalEditarProveedor.value = false
      loading.value = true;
      try {
        const { data: { proveedores } } = await Api.get('/proveedores');
        rows.value = proveedores;
      } catch (error) {
        alert(error)
      }
      loading.value = false;
    }

    const activarDesactivarProveedor = async (proveedor_id, estado) => {
      try {
        await Api.delete(`/proveedores/${ proveedor_id }/${ estado }`)
        mostrarNotify('positive', 'Proveedor eliminado exitosamente');
        getProveedores();
      } catch (error) {
        alert(error);
      }
    }

    const editarProveedor = ( proveedor ) =>{
      proveedorData.value = proveedor;
      modalEditarProveedor.value = true;
    }

    getProveedores();

    return {
      editarProveedor,
      modalAgregarProveedor,
      modalEditarProveedor,
      activarDesactivarProveedor,
      columns,
      loading,
      filter,
      getProveedores,
      isPwd: ref(true),
      rows,
      proveedorData,
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
