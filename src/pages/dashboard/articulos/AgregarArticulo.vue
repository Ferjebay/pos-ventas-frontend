<template>
  <q-card style="width: 700px; max-width: 80vw;">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Agregar Articulo(s)</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section>
      <q-form>
        <div class="row q-gutter-md">
          <div class="offset-1 col-xs-10 col-sm-5">
            <label>Marca:</label>
            <q-input v-model.trim="formArticulo.marca" dense filled required />
          </div>

          <div class="col-xs-10 col-sm-5 ">
            <label>Modelo:</label>
            <q-input v-model.trim="formArticulo.modelo" dense filled required />
          </div>

          <div class="offset-1 col-xs-10 col-sm-5 ">
            <label>Proveedor:</label>
            <q-select filled required dense emit-value map-options
              v-model="formArticulo.proveedor_id" :options="listProveedores" />
          </div>

          <div class="col-xs-10 col-sm-5 ">
            <label>Precio Base:</label>
            <q-input type="number" v-model.trim="formArticulo.precio_base" dense filled required>
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-input>
          </div>

          <div class="offset-1 col-xs-10 col-sm-6">
            <label>Ingresar Codigo IMEI:</label>
            <q-input dense filled v-model.trim="cod_imei" @keyup.enter="agregarDetalles" />
          </div>

          <div class="col-12" v-if="rows.length > 0">
            <div class="q-pa-md scrollbar" id="div1" style="padding-right: 3px; padding-top: 0px;">
              <table style="width: 100%;" class="force-overflow">
                <thead class="text-center">
                  <th>#</th>
                  <th>IMEI</th>
                  <th>COLOR</th>
                  <th>QUITAR</th>
                </thead>
                <tbody class="text-center">
                  <tr v-for="(row, index) in rows" :key="index">
                    <td style="width: 10%;">{{ index + 1 }}</td>
                    <td style="width: 35%;">{{ row.imei }}</td>
                    <td style="width: 30%;">
                      <q-input v-model="row.color" input-class="text-center" dense />
                    </td>
                    <td style="width: 25%;">
                      <q-btn round color="blue-grey"
                        icon="close"
                        @click="eliminarFila(row)"
                        size="sm" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-xs-9 col-sm-12  flex justify-center">
            <q-btn @click="submit" :loading="loading"
              label="Guardar" class="q-px-xl" color="green-9"/>
          </div>

        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import Api from "../../../apis/Api"
import useHelpers from "../../../composables/useHelpers";
const columns = [
  { name: 'num', field: 'num', label: '#', align: 'left' },
  { name: 'imei', align: 'center', label: 'IMEI', field: 'imei' },
  { name: 'color', label: 'COLOR', field: 'color', align: 'center' },
  { name: 'acciones', label: 'ACCIONES', align: 'center' }
]

export default defineComponent({
  name: 'AgregarArticulo',
  setup(_,  { emit }) {

    const formArticulo = ref({
      marca: '',
      modelo: '',
      proveedor_id: '',
      precio_base: ''
    })
    const cod_imei = ref('');
    const listProveedores = ref([]);
    const rows = ref([]);
    const loading = ref( false );

    const { mostrarNotify } = useHelpers();

    const agregarDetalles = () => {
      if (cod_imei.value.length == 0 || cod_imei.value == '') {
        return mostrarDialog('warning', 'Debes agregar el codigo IMEI')
      }
      //Validar si el codigo IMEI ya esta ingresado
      const isRepit = rows.value.some( row => row.imei ==cod_imei.value )
      if( isRepit ){
        cod_imei.value = '';

        return mostrarDialog('warning', 'Este codigo IMEI ya se encuentra ingresado')
      }

      rows.value.unshift({
        num: (rows.value.length + 1),
        imei: cod_imei.value,
        color: ''
      })
      cod_imei.value = ''
    }

    const getProveedores = async () => {
      try {
        const { data: { proveedores } } = await Api.get('/proveedores');
        listProveedores.value = [];

        proveedores.forEach(proveedor => {
          if ( proveedor.estado == '1' )
            listProveedores.value.push({ label: proveedor.razon_social, value: proveedor.id })
        });
      } catch (error) {
        alert(error)
      }
    }

    getProveedores();

    const eliminarFila = ( fila ) => {
      const indice = rows.value.findIndex( row => row.imei == fila.imei )
      rows.value.splice(indice, 1);
    }

    const submit = async () => {
      if ( formArticulo.value.marca.length == 0 )
        return mostrarDialog('warning', 'Por favor, completa el campo marca')

      if ( formArticulo.value.modelo.length == 0 )
        return mostrarDialog('warning', 'Por favor, completa el campo modelo')

      if ( formArticulo.value.proveedor_id.length == 0 )
        return mostrarDialog('warning', 'Por favor, elige un proveedor')

      if ( formArticulo.value.precio_base.length == 0 )
        return mostrarDialog('warning', 'Por favor, ingresa el precio base')

      if ( rows.value.length == 0 )
        return mostrarDialog('warning', 'Debes agregar al menos 1 codigo IMEI')

      formArticulo.value.detalles = rows.value;

      try {
        loading.value = true;
        await Api.post('/articulos', formArticulo.value)
        emit('actualizarLista');
        mostrarNotify('positive', 'Articulos Agregados Exitosamente');
        loading.value = false;
      } catch (error) {
        alert(error);
        loading.value = false;
      }
    }

    watch(formArticulo.value, (currentValue, _) => {
      formArticulo.value.marca = currentValue.marca.toUpperCase();
      formArticulo.value.modelo = currentValue.modelo.toUpperCase()
    });

    return {
      agregarDetalles,
      eliminarFila,
      rows,
      columns,
      cod_imei,
      listProveedores,
      loading,
      formArticulo,
      submit
    }
  }
})
</script>

<style scoped>
#div1 {
  overflow-y:scroll;
  overflow-x: hidden;
  max-height:200px;
  width:100%;
}
#div1 table {
  width:100%;
  background-color:rgb(248, 243, 243);
  text-align: left;
	border-collapse: collapse;
}
th{
	padding: 10px;
}

thead{
	background-color: #246355;
	border-bottom: solid 5px #0F362D;
	color: white;
}

tr:nth-child(even){
	background-color: rgb(228, 221, 221);
}

/* .scrollbar
{
	background: #F5F5F5;
	overflow-y: scroll;
	margin-bottom: 25px;
} */

/* .force-overflow
{
	min-height: 450px;
} */

#div1::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	border-radius: 10px;
	background-color: #F5F5F5;
}

#div1::-webkit-scrollbar
{
	width: 12px;
	background-color: #F5F5F5;
}

#div1::-webkit-scrollbar-thumb
{
	border-radius: 10px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
	background-color: #555;
}
/*
tr:hover td{
	background-color: #369681;
	color: white;
} */
</style>
