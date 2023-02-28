import { useAuthUserStore } from "stores/auth-user"

const useRolPermisos = () => {

    const authUserStore = useAuthUserStore();

    const encontrarPermisosId = ( permisosSelected, permisos ) => {
      const permisosId = [];
      permisosSelected.value.forEach( rol => {
        permisos.forEach(s => {
          s.children.forEach(c => {
            c.children.find( rolFind => {
              if (rolFind.label == rol) permisosId.push(rolFind.id)
            })
          })
        });
      })

      return permisosId;
    }

    const validarPermisos = ( permiso ) => {
      if(authUserStore.permisos !== null && authUserStore.permisos.includes( permiso ))
        return true;
      else
        return false;
    }

    return{
      encontrarPermisosId,
      validarPermisos
    }
}

export default useRolPermisos
