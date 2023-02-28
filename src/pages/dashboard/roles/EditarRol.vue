<template>
  <q-card style="width: 700px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6">Editar Rol</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form @submit="submit">
        <div class="row q-gutter-sm justify-around">

          <div class="col-xs-12 col-sm-5">
            <label>Nombre del Rol:</label>
            <q-input v-model.trim="nombreRol" input-class="text-center"
              dense filled required />
          </div>

          <div class="col-xs-12">
            <q-tree class="col-12 col-sm-6"
              :nodes="listPermisos"
              node-key="label"
              tick-strategy="leaf"
              v-model:expanded="expanded"
              v-model:ticked="rolesSelected"
            />
          </div>

          <div class="col-xs-9 col-sm-12  flex justify-center">
            <q-btn label="Guardar" class="q-px-xl" type="submit" color="green-9"/>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import useRolPermisos from "../../../composables/useRolPermisos";
import Api from "../../../apis/Api"
import listPermisos from "./listPermisos.json";

export default defineComponent({
  name: 'EditarRol',
  props: ['rolData'],
  setup (props,  { emit }) {
    const nombreRol = ref('');
    const rolesSelected = ref([]);
    const $q = useQuasar();
    const { encontrarPermisosId } = useRolPermisos();

    const { id, nombre, permisos_nombres } = props.rolData;
    const arrayPermisosName = permisos_nombres.split('|');

    arrayPermisosName.forEach(permiso => {
      rolesSelected.value.push(permiso)
    });

    nombreRol.value = nombre;

    const submit = async() => {

      if (rolesSelected.value.length == 0) {
        return $q.notify({
            type: 'warning',
            message: 'Debes elegir algun permiso',
            position: 'top-right'
        })
      }
      const permisosId = encontrarPermisosId( rolesSelected, listPermisos );
      const formRol = {
        rol: nombreRol.value,
        permisosId
      }

      try {
        await Api.put(`/roles/${ id }`, formRol)
        emit('actualizarLista');
        $q.notify({
          type: 'positive',
          message: 'Rol Agregado Exitosamente',
          position: 'top-right'
        })
      } catch (error) {
        alert(error);
      }

    }

    watch( nombreRol, ( newValue, _ ) =>{
      nombreRol.value = newValue.toUpperCase();
    })

    return {
      nombreRol,
      expanded: ref(['Seleccionar todos los permisos']),
      rolesSelected,
      listPermisos,
      submit
    }
  }
})
</script>
