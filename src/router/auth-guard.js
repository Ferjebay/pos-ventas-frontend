import JWT from 'jwt-client'

const isAuthenticated = (to, from, next) => {
  if ( to.meta.requiresAuth ) {
    const token = JSON.parse(localStorage.getItem('auth/user'));
    if (token){
      try{
        var jwtValue = JWT.read(token.token);
        JWT.validate(jwtValue);
        next();
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
