import JWT from 'jwt-client'


const isAuthenticated = (to, from, next) => {
  if ( to.meta.requiresAuth ) {
    const token = JSON.parse(localStorage.getItem('auth/user'));
    if (token){
      try{
        var jwtValue = JWT.read(token.token);
        JWT.validate(jwtValue);

        //Validar a que no accedan a rutas no permitidas
        const permisos = JSON.parse(localStorage.getItem('auth/user')).permisos
        if(permisos.includes(to.name) || to.name == 'dashboard'){
          return next();
        }else{
          let listRolPermisosByUsuarioFilter = [];
          permisos.map(function(x){
            if(x.includes('index')){
              listRolPermisosByUsuarioFilter.push(x);
            }
          })
          next({name: listRolPermisosByUsuarioFilter[0]});
        }

      }catch (e) {
        next('/login');
      }
    }else{
      next('/login');
    }
  }else{
    next();
  }
}

export default isAuthenticated
