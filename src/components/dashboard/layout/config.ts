import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Facturas', href: paths.dashboard.customers, icon: 'file-text' },
  { key: 'integrations', title: 'Reglamento', href: paths.dashboard.integrations, icon: 'file-text' },
  { key: 'settings', title: 'Configuraciones', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Cuenta', href: paths.dashboard.account, icon: 'user' },
  { key: 'campaigns', title: 'Campañas', href: paths.campaigns.list, icon: 'gift' },
  { key: 'promotions', title: 'Promociones', href: paths.dashboard.account, icon: 'ticket' },
  { key: 'store', title: 'Locales Comerciales', href: paths.dashboard.account, icon: 'store' },
  { key: 'online-invoices', title: 'Facturas Online', href: paths.dashboard.account, icon: 'fac-online' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
