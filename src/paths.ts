export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
  campaigns: {
    list: '/campaigns/list',
    create: '/campaigns/create',
    edit: '/campaigns/edit/:id',
    addPromotions: '/comercial_stores/addPromotions/:id',
    addStores: '/comercial_stores/addStores/:id',
  },
  promotions: { list: '/promotions/list', create: '/promotions/create', edit: '/promotions/edit/:id' },
  comercial_stores: {
    list: '/comercial_stores/list',
    create: '/comercial_stores/create',
    edit: '/comercial_stores/edit/:id',
  },
} as const;
