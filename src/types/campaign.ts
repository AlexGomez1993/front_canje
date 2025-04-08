export interface Campaign {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  configuracion?: any;
  logo?: string;
  promociones?: any;
}

export interface CampaignResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Campaign[];
}
