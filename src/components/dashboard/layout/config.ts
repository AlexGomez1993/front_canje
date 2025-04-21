import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItemsUserTI = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Facturas', href: paths.dashboard.customers, icon: 'file-text' },
  { key: 'online-invoices', title: 'Factura', href: paths.dashboard.account, icon: 'file-text' },
  { key: 'integrations', title: 'Reglamento', href: paths.dashboard.integrations, icon: 'file-text' },
  { key: 'campaigns', title: 'Campañas', href: paths.campaigns.list, icon: 'gift' },
  { key: 'promotions', title: 'Promociones', href: paths.promotions.list, icon: 'ticket' },
  { key: 'comercial_stores', title: 'Locales Comerciales', href: paths.comercial_stores.list, icon: 'store' },
  { key: 'payment_methods', title: 'Formas de Pago', href: paths.payment_methods.list, icon: 'payment_methods' },
  { key: 'settings', title: 'Configuraciones', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Cuenta', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];

export const navItemsClient = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'account', title: 'Cuenta', href: paths.dashboard.account, icon: 'user' },
  { key: 'customeronline', title: 'Facturas Online', href: paths.dashboard.customeronline, icon: 'file-text' },
] satisfies NavItemConfig[];

export const navItemsMkt = [
  { key: 'integrations', title: 'Reglamento', href: paths.dashboard.integrations, icon: 'file-text' },
  { key: 'customers', title: 'Facturas', href: paths.dashboard.customers, icon: 'file-text' },
  { key: 'online-invoices', title: 'Cuenta', href: paths.dashboard.account, icon: 'fac-online' },
  { key: 'customeronline', title: 'Facturas Online', href: paths.dashboard.customeronline, icon: 'file-text' },
  { key: 'aprobacionline', title: 'Aprobación Facturas Online', href: paths.dashboard.aprobacionline, icon: 'fac-online' },
] satisfies NavItemConfig[];
