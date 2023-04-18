<template>
  <q-page>
    <div class="row q-py-lg q-pl-md">
      <div class="col-md-6">
        <label class="text-h6">Listado de Clientes</label>
      </div>
      <div class="col-md-6 flex justify-end">
        <q-btn color="secondary" v-if="validarPermisos('Agregar Cliente')"
        icon-right="person_add" label="Agregar Cliente" class="q-mr-md"
        @click="modalAgregarCliente = !modalAgregarCliente"
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
            :loading = "loading"
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
                v-if="validarPermisos('Editar Cliente')"
                @click="editarCliente(props.row)"
                icon="edit"
                class="q-mr-sm"
                size="11px" />

                <template v-if="props.row.estado">
                  <q-btn round color="blue-grey"
                  icon="close"
                  @click="activarDesactivarCliente(props.row.id, false)"
                  size="11px" />
                </template>

                <template v-else>
                  <q-btn round color="positive"
                  class="q-mr-sm"
                  icon="done"
                  @click="activarDesactivarCliente(props.row.id, true)"
                  size="11px" />

                  <q-btn round color="deep-orange"
                  icon="delete"
                  @click="eliminarCliente(props.row.id)"
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

  <q-dialog v-model="modalAgregarCliente">
    <Add @actualizarLista="getClientes" />
  </q-dialog>

  <q-dialog v-model="modalEditarCliente">
    <Editar :clienteData="clienteData" @actualizarLista="getClientes" />
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
  { name: 'nombres', align: 'center', label: 'Cliente', field: 'nombres', sortable: true },
  { name: 'tipo_documento', align: 'center', label: 'Tipo de Documento', field: 'tipo_documento' },
  { name: 'num_documento', align: 'center', label: 'Numero de Documento', field: 'num_documento' },
  { name: 'email', label: 'Email', field: 'email', align: 'center'},
  { name: 'celular', label: 'Celular', field: 'celular',  align: 'center' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'acciones', label: 'acciones', align: 'center' }
]

export default defineComponent({
  name: 'IndexCliente',
  components: { Add, Editar },
  setup () {
    const { validarPermisos } = useRolPermisos();
    const filter = ref('')
    const rows = ref([]);
    const modalAgregarCliente = ref(false);
    const modalEditarCliente = ref(false);
    const clienteData = ref({});
    const { mostrarNotify } = useHelpers();
    const loading = ref( false )

    const getClientes = async () => {
      //ocultar modales
      modalAgregarCliente.value = false
      modalEditarCliente.value = false
      loading.value = true;
      try {
        rows.value = [];
        const { data: { clientes } } = await Api.get('/clientes');
        clientes.forEach(cliente => {
          if( cliente.nombres != 'CONSUMIDOR FINAL' ) rows.value.push( cliente );
        });
      } catch (error) {
        alert(error)
      }
      loading.value = false;
    }

    const activarDesactivarCliente = async (cliente_id, estado) => {
      try {
        await Api.delete(`/clientes/${ cliente_id }/${ estado }`)
        mostrarNotify('positive', 'Cliente eliminado exitosamente');
        getClientes();
      } catch (error) {
        alert(error);
      }
    }

    const eliminarCliente = async (cliente_id) => {
      Dialog.create({
        title: '¿Deseas Eliminar este cliente?',
        message: 'Una vez eliminado no podra recuperarse...!',
        ok: { push: true, label:'Eliminar', color: 'teal-7' },
        cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
      }).onOk(async () => {
          try {
            await Api.delete(`/clientes/${ cliente_id }`)
            mostrarNotify('positive', 'Cliente eliminado exitosamente');
            getClientes();
          }catch(error) {
            mostrarNotify('negative', error.response.data.message);
          }
        })
    }

    const editarCliente = ( cliente ) =>{
      clienteData.value = cliente;
      modalEditarCliente.value = true;
    }

    getClientes();

    return {
      editarCliente,
      modalAgregarCliente,
      modalEditarCliente,
      activarDesactivarCliente,
      columns,
      filter,
      loading,
      getClientes,
      eliminarCliente,
      isPwd: ref(true),
      rows,
      clienteData,
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
