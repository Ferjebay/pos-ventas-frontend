<template>
  <q-page>
    <div class="row q-my-lg q-pl-md">
      <div class="col-md-6">
        <label class="text-h6">Listado de Proveedores</label>
      </div>
      <div class="col-md-6 flex justify-end">
        <q-btn color="secondary" v-if="validarPermisos('Agregar Usuario')"
        icon-right="person_add" label="Agregar Proveedor" class="q-mr-md"
        @click="modalAgregarProveedor = !modalAgregarProveedor"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="q-pa-md">
          <q-table
            :rows="rows"
            :columns="columns"
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
import { defineComponent, ref, watch } from 'vue'
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
  name: 'IndexUsuario',
  components: { Add, Editar },
  setup () {
    const { validarPermisos } = useRolPermisos();
    const filter = ref('')
    const rows = ref([]);
    const modalAgregarProveedor = ref(false);
    const modalEditarProveedor = ref(false);
    const proveedorData = ref({});
    const { mostrarNotify } = useHelpers();
    const formUsuario = ref({
      nombres: '',
      apellidos: '',
      cedula: '',
      celular: '',
      email: '',
      password: '',
    })

    const getProveedores = async () => {
      //ocultar modales
      modalAgregarProveedor.value = false
      modalEditarProveedor.value = false
      Loading.show({message: 'Cargando...'});
      try {
        const { data: { proveedores } } = await Api.get('/proveedores');
        rows.value = proveedores;
      } catch (error) {
        alert(error)
      }
      Loading.hide()
    }

    getProveedores();

    const activarDesactivarProveedor = async (proveedor_id, estado) => {
      try {
        await Api.delete(`/proveedores/${ proveedor_id }/${ estado }`)
        mostrarNotify('positive', 'Proveedor eliminado exitosamente');
        getProveedores();
      } catch (error) {
        alert(error);
      }
    }

    const onSubmit = async () => {
      const resultado = await Api.post('/usuarios', formUsuario.value)
      console.log(resultado);
    }

    const editarProveedor = ( proveedor ) =>{
      proveedorData.value = proveedor;
      modalEditarProveedor.value = true;
    }

    watch(formUsuario.value, (currentValue, oldValue) => {
      formUsuario.value.nombres = currentValue.nombres.toUpperCase();
      formUsuario.value.apellidos = currentValue.apellidos.toUpperCase()
    });

    return {
      editarProveedor,
      modalAgregarProveedor,
      modalEditarProveedor,
      activarDesactivarProveedor,
      columns,
      formUsuario,
      filter,
      getProveedores,
      onSubmit,
      isPwd: ref(true),
      rows,
      proveedorData,
      validarPermisos
    }
  }
})
</script>
