import { useQuasar } from 'quasar'

const useHelpers = () => {

  const $q = useQuasar();

  const mostrarNotify = (type, message, position = 'top-right') => {
    $q.notify({
      type,
      message,
      position
    })
  }

    return{
      mostrarNotify
    }
}

export default useHelpers
