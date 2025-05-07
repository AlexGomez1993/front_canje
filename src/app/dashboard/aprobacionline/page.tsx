'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import axiosClient from '@/lib/axiosClient';
import { Invoice } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';
import { Store } from '@/types/comercial_store';
import axios from 'axios';

interface Factura {
  id: number;
  createdAt: string;
  ruc: string;
  numero: string;
  monto: string;
  formapago_id: string;
  imagen: string;
  voucher: string;
}
type Campania = {
  id: number;
  nombre: string;
  promociones: Promocion[];
  configuracion: any;
  tiendas: Store[]
};

type Promocion = {
  id: number;
  nombre: string;
  montominimo: number;
  // otros campos...
};
type FacturaAgregada = {
  id: string;
  promocion: string;
  montoMinimo: number;
  saldoAnterior: number;
  montoConFactor: number;
  cupones: number;
  total: number;
  campania: string;
  nuevoSaldo: number;
};
const FacturasTable = () => {
  const { user } = useUser();
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openFacturaDialog, setOpenFacturaDialog] = useState(false);
  const [openRechazoDialog, setOpenRechazoDialog] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [selectedImage, setSelectedImage] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [selectedCampania, setSelectedCampania] = useState<Campania | null>(null);
  const [montoMinimo, setMontoMinimo] = useState<string>('');
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [selectedPromocion, setSelectedPromocion] = useState<Promocion | null>(null);
  const theme = useTheme();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [facturasAgregadas, setFacturasAgregadas] = useState<any[]>([]);
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [formaPagoId, setFormaPagoId] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRuc, setFilterRuc] = useState<string>('');
  const [totalPage, setTotalPage] = useState(1);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [cuponesAImprimir, setcuponesAImprimir] = useState(0)

  const eliminarFactura = (index: number) => {
    setFacturas(facturas.filter((_, i) => i !== index));
  };

  const fetchFacturas = async () => {
    try {
      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=1`, {
        params: {
          limit: rowsPerPage,
          page: currentPage,
          ruc: filterRuc,
        },
      }
      );

      setFacturas(response.data.data || []);
      setTotalPage(response.data.totalPaginas);
      setTotalFacturas(response.data.total);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    }
  };
  useEffect(() => {
    fetchFacturas();
  }, [currentPage, rowsPerPage, filterRuc]);


  useEffect(() => {
    const fetchFormasPago = async () => {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/formasPago`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // Filtrar solo las activas
        const formasActivas = data.data.filter((fp: any) => fp.activo);
        setFormasPago(formasActivas);
      } catch (error) {
        console.error('Error al cargar formas de pago:', error);
        setFormasPago([]);
      }
    };

    fetchFormasPago();
  }, []);
  useEffect(() => {
    const fetchCampanias = async () => {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campanias?activo=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCampanias(data.data || []);
      } catch (error) {
        console.error('Error al cargar campañas:', error);
      }
    };

    fetchCampanias();
  }, []);
  const handleProcesarFactura = async () => {
    if (!facturaSeleccionada || !selectedPromocion || !selectedCampania || saldo === null) return;

    const formaPago = formasPago.find((fp) => fp.id === formaPagoId);
    const factor = formaPago?.factor || 1;
    const montoFactura = Number(facturaSeleccionada.monto);
    const saldoAnterior = Number(saldo);
    const montoMinimo = selectedPromocion.montominimo;
    const total = (saldoAnterior + montoFactura);
    const numcupones = Math.floor(total / montoMinimo) * factor;
    const nuevoSaldo = total % montoMinimo;

    try {
      const response = await axiosClient.put(`/api/facturas/procesarFacturaWeb`, {
        factura_id: facturaSeleccionada.id,
        promocion: {
          id: selectedPromocion.id,
          montominimo: montoMinimo,
          nuevoSaldo: nuevoSaldo,
        },
        usuario_id: user?.id,
        numcupones: numcupones,
        campania: {
          id: selectedCampania.id,
          nombre: selectedCampania.nombre,
          tipo_configuracion: selectedCampania.configuracion.descripcion,
        },
      });
      setSnackbarType('success');
      setSnackbarMsg('Factura procesada con éxito');
      setOpenFacturaDialog(false);
      //handleImprimirCupon(cuponesAImprimir);
      setSelectedPromocion(null);
      setSelectedCampania(null);
      setSaldo(null)
      fetchFacturas();
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setSnackbarType('error');
      setSnackbarMsg('Error al procesar la fatura');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleFormaPagoChange = (event: SelectChangeEvent<number>) => {
    setFormaPagoId(Number(event.target.value));
  };
  // Función para dividir el array de cupones en pares
  const chunkArray = (arr: any[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

  const handleImprimirCupon = (cuponData: any[]) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupones</title>
            <style>
              @media print {
                /* Estilos existentes... */
            </style>
          </head>
          <body>
            ${chunkArray(cuponData, 2)
          .map(
            (pair) => `
              <div class="page-container">
                <div class="cut-guide cut-guide-top"></div>
                <div class="cut-guide cut-guide-bottom"></div>
                ${pair
                .map(
                  (data) => `
                  <div class="coupon">
                    <img src="${data.logo}" class="logo" alt="Logo">
                    <h2>SCALA SHOPPING</h2>
                    
                    <p><strong>N° CUPÓN:</strong> ${data.numCupon}</p>
                    <p><strong>FECHA:</strong> ${data.hoy}</p>
                    <p><strong>CLIENTE:</strong> ${data.cliente.nombre} ${data.cliente.apellidos}</p>
                    <p><strong>CI/RUC:</strong> ${data.cliente.ruc}</p>
                    <p><strong>TELÉFONO:</strong> ${data.cliente.telefono}</p>
                    <p><strong>CELULAR:</strong> ${data.cliente.celular}</p>
                    <p><strong>DIRECCIÓN:</strong> ${data.cliente.direccion}</p>
                    <p><strong>CAMPAÑA:</strong> ${data.campania}</p>
                    <p><strong>CUPONES:</strong> ${data.cupones}</p>
                    
                    <div class="nota">
                      ${data.nota}
                    </div>
                  </div>
                `
                )
                .join('')}
              </div>
            `
          )
          .join('')}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }, 500);
      };
    }
  };
  const handleAgregarFactura = () => {
    if (!saldo || !facturaSeleccionada || !selectedPromocion || !selectedCampania) return;
    const formaPago = formasPago.find((fp) => fp.id === facturaSeleccionada.formaPago_id);
    const factor = formaPago?.factor || 1;
    const montoFactura = Number(facturaSeleccionada.monto);
    const saldoNumerico = Number(saldo);
    const montoMinimo = Number(selectedPromocion.montominimo);
    const total = saldoNumerico + montoFactura;
    const cantidadCupones = Math.floor(total / montoMinimo) * factor;
    const nuevoSaldo = total % montoMinimo;
    if (cantidadCupones > 0) {
      const hoy = new Date().toLocaleDateString('es-ES');
      const cuponData = Array.from({ length: cantidadCupones }, (_, index) => ({
        numCupon: `${facturaSeleccionada.id}-${index + 1}`,
        hoy,
        cliente: facturaSeleccionada.cliente,
        promocion: selectedPromocion.nombre,
        montoMinimo: montoMinimo,
        saldoAnterior: saldoNumerico,
        campania: selectedCampania.nombre,
        factor: factor, // Mostrar factor en el cupón
        montoConFactor: montoFactura,
        cupones: cantidadCupones,
        total: total,
        nuevoSaldo: nuevoSaldo,
        logo: '/logo-scala.png',
        nota: `Favor conservar sus facturas.<br>
          “El cliente para participar en la promoción confiere voluntariamente sus datos personales..."`,
      }));

      //handleImprimirCupon(cuponData);
    }
    // Agregar al estado de facturas agregadas
    console.log('facturasAgregadas', facturasAgregadas)
    setFacturasAgregadas((prev) => [
      ...prev,
      {
        local: facturaSeleccionada?.local?.nombre || 'N/A',
        pago: formaPago?.nombre,
        promocion: selectedPromocion.nombre,
        factura: facturaSeleccionada.numero,
        monto: facturaSeleccionada.monto,
        campania: selectedCampania.nombre,
        montoMinimo: montoMinimo,
        saldoAnterior: saldoNumerico,
        montoConFactor: montoFactura,
        cupones: cantidadCupones,
        total: total,
        nuevoSaldo: nuevoSaldo,
      },
    ]);

  };
  const tableHeaderStyles: SxProps = {
    backgroundColor: theme.palette.primary.light,
    '& .MuiTableCell-head': {
      color: theme.palette.common.black,
      fontWeight: 600,
    },
  };
  const handleCampania = (campaniaId: number) => {
    const selected = campanias.find((c) => c.id === campaniaId) || null;
    setSelectedCampania(selected);
    setSelectedPromocion(null);
    setMontoMinimo('');
  };
  const handlePromocionChange = async (event: SelectChangeEvent<string>) => {
    const selectedId = parseInt(event.target.value);
    const promocionSeleccionada = selectedCampania?.promociones.find((p) => p.id === selectedId);
    setSelectedPromocion(promocionSeleccionada || null);

    if (promocionSeleccionada) {
      calcularSaldo();
    }
  };
  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };
  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterRuc(event.target.value);
    setCurrentPage(1);
  };
  const handleOpenDialog = (factura: any) => {
    setFacturaSeleccionada(factura);
    setOpenRechazoDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenRechazoDialog(false);
    setObservacion('');
  };

  const handleConfirmarRechazo = async () => {
    try {
      await axiosClient.put('/api/facturas/rechazarFacturaWeb', {
        factura_id: facturaSeleccionada.id,
        observacion: observacion,
        usuario_id: user?.id
      })
      setSnackbarType('success');
      setSnackbarMsg('Factura rechazada con éxito');
      fetchFacturas();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al rechazar la fatura');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAprobarClick = (factura: any) => {
    setFacturaSeleccionada(factura);
    handleCampania(factura.campania_id);
    setOpenFacturaDialog(true);
  };

  const calcularSaldo = async () => {
    if (!facturaSeleccionada?.cliente?.id) return;
    setLoadingSaldo(true);

    try {
      const response = await axiosClient.post(`/api/saldosCliente`, {
        cliente_id: facturaSeleccionada.cliente.id,
      });
      const saldosCliente = response.data.data;
      if (saldosCliente && saldosCliente.length > 0) {
        const saldoCamPromo = saldosCliente.find((s: any) => s.campania_id == selectedCampania!.id && s.promocion_id == selectedPromocion!.id)
        if (saldoCamPromo) {
          setSaldo(saldoCamPromo.saldo);
        }

      } else {
        setSaldo(0);
      }
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      setSaldo(0);
    } finally {
      setLoadingSaldo(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: '#1976d2',
          display: 'flex',
          alignItems: 'center',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Invoice style={{ marginRight: 8 }} />
        Facturas Online
      </Typography>
      <TextField
        label="Filtrar por ci/ruc"
        variant="outlined"
        value={filterRuc}
        onChange={handleFilterChange}
        fullWidth
        sx={{ marginBottom: 2 }}
        size="small"
      />

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filas por página</InputLabel>
        <Select value={rowsPerPage} onChange={handleRowsPerPageChange} label="Filas por página" size="small">
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
        </Select>
      </FormControl>
      <TableContainer>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead sx={tableHeaderStyles}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>RUC</TableCell>
              <TableCell>Local</TableCell>
              <TableCell>Factura</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Forma de Pago</TableCell>
              <TableCell>Cabecera Factura</TableCell>
              <TableCell>Voucher</TableCell>
              <TableCell align="center">Aprobar</TableCell>
              <TableCell align="center">Rechazar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(facturas) &&
              facturas.map((factura, idx) => (
                <TableRow key={factura.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{new Date(factura.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{factura.ruc}</TableCell>
                  <TableCell>{factura.tienda ? factura.tienda.nombre : '-'}</TableCell>
                  <TableCell>{factura.numero}</TableCell>
                  <TableCell align="right">${parseFloat(factura.monto).toFixed(2)}</TableCell>
                  <TableCell>{factura.formapago_id}</TableCell>

                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={factura.imagen}
                      alt="Cabecera"
                      sx={{ width: 120, height: 120, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedImage(factura.imagen);
                        setOpenImageDialog(true);
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={factura.voucher}
                      alt="Voucher"
                      sx={{ width: 120, height: 120, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedImage(factura.voucher);
                        setOpenImageDialog(true);
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 500,
                      }}
                      onClick={() => handleAprobarClick(factura)}
                    >
                      Aprobar
                    </Button>
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleOpenDialog(factura)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 500,
                      }}
                    >
                      Rechazar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalPage}
        page={currentPage}
        onChange={handleChangePage}
        sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
      />
      <div className="flex justify-between items-center p-3 bg-gray-50">
        <Typography variant="body2" color="textSecondary">
          Mostrando {facturas.length} de {totalFacturas} registros
        </Typography>
      </div>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
      <Dialog open={openFacturaDialog} onClose={() => setOpenFacturaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Información de la Factura</DialogTitle>
        <DialogContent>
          {facturaSeleccionada && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="RUC"
                  variant="outlined"
                  value={facturaSeleccionada?.cliente?.ruc || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Nombre"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.nombre || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Apellido"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.apellidos || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo"
                  type="email"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.email || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dirección"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.direccion || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.telefono || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Celular"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.celular || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mt: 0.3 }}>
                  <InputLabel id="campania-label">Campaña</InputLabel>
                  <Select
                    labelId="campania-label"
                    value={selectedCampania?.id || ''}
                    displayEmpty
                    label="Campaña"
                    disabled
                  >
                    {campanias.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mt: 0.3 }}>
                  <InputLabel id="promocion-label">Promoción</InputLabel>
                  <Select
                    labelId="promocion-label"
                    value={selectedPromocion?.id?.toString() || ''}
                    onChange={handlePromocionChange}
                    displayEmpty
                    label="Promoción"
                    disabled={!selectedCampania}
                  >
                    {selectedCampania?.promociones.map((p) => (
                      <MenuItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {selectedPromocion && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monto Mínimo"
                    variant="outlined"
                    value={`$${Number(selectedPromocion.montominimo).toFixed(2)}`}
                    disabled
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Local"
                  variant="outlined"
                  value={facturaSeleccionada.tienda?.nombre || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Button variant="outlined" onClick={calcularSaldo} fullWidth disabled={loadingSaldo}>
                  {loadingSaldo ? 'Calculando...' : 'Calcular Saldo'}
                </Button>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Saldo"
                  variant="outlined"
                  value={saldo ? `$${Number(saldo).toFixed(2)}` : ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Monto" variant="outlined" value={facturaSeleccionada.monto} disabled />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Número de Factura"
                  variant="outlined"
                  value={facturaSeleccionada.numero}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="forma-pago-label">Forma de Pago</InputLabel>
                  <Select
                    labelId="forma-pago-label"
                    value={facturaSeleccionada.formapago_id}
                    onChange={handleFormaPagoChange}
                    label="Forma de Pago"
                    disabled
                  >
                    {formasPago.map((fp) => (
                      <MenuItem key={fp.id} value={fp.id}>
                        {fp.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button variant="contained" color="success" onClick={handleAgregarFactura}>
                  Agregar Factura
                </Button>
              </Grid>
            </Grid>
          )}
          {/* TABLA DETALLE FACTURAS */}
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Local</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell>Factura</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Campaña</TableCell>
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturasAgregadas.map((factura, index) => (
                  <TableRow key={index}>
                    <TableCell>{facturaSeleccionada.tienda ? facturaSeleccionada.tienda.nombre : '-'}</TableCell>
                    <TableCell>{factura.pago}</TableCell>
                    <TableCell>{factura.factura}</TableCell>
                    <TableCell>{parseFloat(factura.monto).toFixed(2)}</TableCell>
                    <TableCell>{factura.campania}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => eliminarFactura(index)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* TABLA DE TOTALES */}
          <TableContainer component={Paper} sx={{ mt: 3, border: '2px solid red' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Promoción</TableCell>
                  <TableCell>Monto Mín.</TableCell>
                  <TableCell>Saldo Ant.</TableCell>
                  <TableCell>Fac. Monto</TableCell>
                  <TableCell>Cupones</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Campaña</TableCell>
                  <TableCell>Saldo Nue.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturasAgregadas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell>{factura.promocion}</TableCell>
                    <TableCell>${factura.montoMinimo}</TableCell>
                    <TableCell>${factura.saldoAnterior}</TableCell>
                    <TableCell>${factura.montoConFactor}</TableCell>
                    <TableCell>{factura.cupones}</TableCell>
                    <TableCell>${parseFloat(factura.total).toFixed(2)}</TableCell>
                    <TableCell>{factura.campania}</TableCell>
                    <TableCell>${parseFloat(factura.nuevoSaldo).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFacturaDialog(false)}>Cerrar</Button>
          <Button variant="contained" color="success" onClick={handleProcesarFactura} disabled={processing}>
            {processing ? 'Procesando...' : 'Procesar Factura Online'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openRechazoDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar Factura</DialogTitle>
        <DialogContent>
          <TextField
            label="Observación"
            multiline
            fullWidth
            minRows={4}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Ingrese el motivo del rechazo..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmarRechazo} color="error" variant="contained">
            Confirmar Rechazo
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FacturasTable;
