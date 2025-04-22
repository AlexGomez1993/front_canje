'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  // otros campos según tu API...
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
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openFacturaDialog, setOpenFacturaDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [selectedCampania, setSelectedCampania] = useState<Campania | null>(null);
  const [montoMinimo, setMontoMinimo] = useState<string>('');
  const [locales, setLocales] = useState<any[]>([]);
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [selectedPromocion, setSelectedPromocion] = useState<Promocion | null>(null);
  const theme = useTheme();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [facturasAgregadas, setFacturasAgregadas] = useState<any[]>([]);
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [formaPagoId, setFormaPagoId] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);

  const eliminarFactura = (index: number) => {
    setFacturas(facturas.filter((_, i) => i !== index));
  };

  const fetchFacturas = async () => {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/facturas?estadoFactura=1&campania_id=1&page=1&limit=3`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log('Respuesta del backend:', data);
      setFacturas(data?.data || []); // asegúrate que sea array
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    }
  };
  useEffect(() => {
    fetchFacturas();
  }, []);

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
    const token = localStorage.getItem('custom-auth-token');
    if (!facturaSeleccionada || !selectedPromocion || !selectedCampania || !formaPagoId || saldo === null) return;
  
    const formaPago = formasPago.find((fp) => fp.id === formaPagoId);
    const factor = formaPago?.factor || 1;
    const montoFactura = Number(facturaSeleccionada.monto);
    const saldoAnterior = Number(saldo);
    const montoMinimo = selectedPromocion.montominimo;
    const total = saldoAnterior + montoFactura;
    const numcupones = Math.floor(total / montoMinimo) * factor;
    const nuevoSaldo = total % montoMinimo;
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facturas/procesarFacturaWeb`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          factura_id: facturaSeleccionada.id,
          promocion: {
            id: selectedPromocion.id,
            montominimo: montoMinimo,
            nuevoSaldo: nuevoSaldo,
          },
          usuario_id: facturaSeleccionada.usuario_id || 2, // asegúrate que este campo esté disponible
          numcupones: numcupones,
          campania: {
            id: selectedCampania.id,
            nombre: selectedCampania.nombre,
            tipo_configuracion: 2, // asegúrate de que esté disponible
          },
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setOpenFacturaDialog(false);
        fetchFacturas(); // Recarga las facturas
      } else {
        console.error('Error al procesar:', data.message);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };
  
  // Agrega el handler para el select
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
    if (!saldo || !facturaSeleccionada || !selectedPromocion || !selectedCampania || !formaPagoId) return;
    const formaPago = formasPago.find((fp) => fp.id === formaPagoId);
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

    //setOpenFacturaDialog(false);
    // Aquí deberías añadir lógica para actualizar el estado de la factura en el backend
  };
  const tableHeaderStyles: SxProps = {
    backgroundColor: theme.palette.primary.light,
    '& .MuiTableCell-head': {
      color: theme.palette.common.black,
      fontWeight: 600,
    },
  };
  const handleCampaniaChange = (event: SelectChangeEvent<number>) => {
    const campaniaId = Number(event.target.value);
    const selected = campanias.find((c) => c.id === campaniaId) || null;
    setSelectedCampania(selected);
    setSelectedPromocion(null); // reset por si cambia
    setMontoMinimo(''); // también puedes setear aquí el mínimo si quieres
    setLocales([]); // resetea locales hasta que escojan promo
  };
  const handlePromocionChange = async (event: SelectChangeEvent<string>) => {
    const selectedId = parseInt(event.target.value);
    const promocionSeleccionada = selectedCampania?.promociones.find((p) => p.id === selectedId);
    setSelectedPromocion(promocionSeleccionada || null);

    if (promocionSeleccionada) {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/locales?promocion_id=${promocionSeleccionada.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setLocales(data.data || []);
      } catch (error) {
        console.error('Error al obtener locales:', error);
        setLocales([]);
      }
    }
  };

  const handleAprobarClick = (factura: any) => {
    setFacturaSeleccionada(factura);
    setOpenFacturaDialog(true);
  };
  const statusChipStyles = (status: string): SxProps => ({
    backgroundColor:
      status === 'aprobado'
        ? theme.palette.success.light
        : status === 'pendiente'
          ? theme.palette.warning.light
          : theme.palette.error.light,
    color: theme.palette.common.white,
    fontWeight: 500,
    minWidth: 100,
  });
  const calcularSaldo = async () => {
    if (!facturaSeleccionada?.cliente?.id) return;

    const token = localStorage.getItem('custom-auth-token');
    setLoadingSaldo(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saldosCliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cliente_id: facturaSeleccionada.cliente.id,
        }),
      });

      const json = await response.json();
      const data = json?.data;

      if (Array.isArray(data) && data.length > 0) {
        console.log(data);
        setSaldo(data[0].saldo);
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
              <TableCell>Estado</TableCell>
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
                  <TableCell>-</TableCell>
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

                  <TableCell>
                    <Chip label={'PENDIENTE'} sx={statusChipStyles('pendiente')} />
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
                    onChange={handleCampaniaChange}
                    displayEmpty
                    label="Campaña" // Este 'label' hace que la etiqueta se mueva al seleccionar algo
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
                    value={formaPagoId}
                    onChange={handleFormaPagoChange}
                    label="Forma de Pago"
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
                    <TableCell>{factura.local}</TableCell>
                    <TableCell>{factura.pago}</TableCell>
                    <TableCell>{factura.factura}</TableCell>
                    <TableCell>{factura.monto}</TableCell>
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
                    <TableCell>${factura.total}</TableCell>
                    <TableCell>{factura.campania}</TableCell>
                    <TableCell>${factura.nuevoSaldo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFacturaDialog(false)}>Cerrar</Button>
          <Button variant="contained" color="success"  onClick={handleProcesarFactura} disabled={processing}>
          {processing ? 'Procesando...' : 'Procesar Factura Online'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer de la tabla */}
      <div className="flex justify-between items-center p-3 bg-gray-50">
        <Typography variant="body2" color="textSecondary">
          Mostrando {facturas.length} de {facturas.length} registros
        </Typography>
        <div className="flex gap-2">
          <Chip label="Aprobados: 0" variant="outlined" color="success" />
          <Chip label={`Pendientes: ${facturas.length}`} variant="outlined" color="warning" />
          <Chip label="Rechazados: 0" variant="outlined" color="error" />
        </div>
      </div>
    </Paper>
  );
};

export default FacturasTable;
