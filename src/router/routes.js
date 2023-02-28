
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/sesion/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'articulos',
        component: () => import('pages/dashboard/articulos/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'articulo/add',
        component: () => import('pages/dashboard/articulos/AgregarArticulo.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'roles',
        component: () => import('pages/dashboard/roles/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'usuarios',
        component: () => import('pages/dashboard/usuarios/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'proveedor',
        component: () => import('pages/dashboard/proveedores/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'ventas',
        component: () => import('pages/dashboard/ventas/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'ventas/add',
        component: () => import('pages/dashboard/ventas/AgregarVenta.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
