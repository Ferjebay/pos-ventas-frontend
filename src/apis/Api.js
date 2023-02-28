import axios from 'axios'

const Api = axios.create({
 	baseURL: import.meta.env.VITE_BASE_URL,
  headers: {'Content-Type': 'application/json'}
});

Api.interceptors.request.use(function(config){
	let token = JSON.parse(localStorage.getItem('auth/user'));
	if(token) token = token.token
	config.headers.Authorization = token ? `${token}` : '';
	return config;
});

export default Api;
