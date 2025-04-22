'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

import Coupon from '../coupon/page';

interface Factura {
  local: string;
  pago: string;
  factura: string;
  promocion: string;
  campania: string;
  monto: number;
  saldoAnterior: number;
  montoConFactor: number;
  cupones: number; // Cupones por campaña
  montoMinimo: number;
  total: number;
  nuevoSaldo: number;
}

interface Cliente {
  nombres: string;
  apellidos: string;
  ciRuc: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  celular: string;
  provincia: string;
  ciudad: string;
}

// Definimos las campañas activas con sus reglas de cálculo
const CAMPAÑAS_ACTIVAS = [
  {
    nombre: 'SAN VALENTIN 2025',
    promoción: 'TODOS LOS LOCALES SAN VALENTIN 2025',
    montoMinimo: 50,
    calcularCupones: (monto: number, pago: string) => {
      if (pago === 'DINERS CLUB') {
        return Math.floor(monto / 50) * 3;
      }
      return Math.floor(monto / 50);
    },
  },
  {
    nombre: 'NAVIDAD 2025',
    promoción: 'TODOS LOS LOCALES NAVIDAD 2025',
    montoMinimo: 35,
    calcularCupones: (monto: number, pago: string) => {
      if (pago === 'DINERS CLUB') {
        return Math.floor(monto / 35) * 2;
      }
      return Math.floor(monto / 35);
    },
  },
];
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

export default function FacturaForm() {
  const [facturas, setFacturas] = React.useState<Factura[]>([]);
  const [local, setLocal] = React.useState('ADIDAS');
  const [monto, setMonto] = React.useState(50);
  const [montoMinimo, setMontoMinimo] = useState<string>('');
  const [pago, setPago] = React.useState('DINERS CLUB');
  const [facturaNum, setFacturaNum] = React.useState('');
  const [ruc, setRuc] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [selectedCampania, setSelectedCampania] = useState<Campania | null>(null);
  const [locales, setLocales] = useState<any[]>([]);
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [selectedPromocion, setSelectedPromocion] = useState<Promocion | null>(null);
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [formaPagoId, setFormaPagoId] = useState<number | ''>('');
  const [openCouponDialog, setOpenCouponDialog] = React.useState(false); // Estado para controlar el modal del cupón
  const [cuponData, setCuponData] = React.useState<
    {
      logo: string;
      numCupon: string;
      hoy: string;
      cliente: {
        nombre: string;
        apellidos: string;
        ruc: string;
        telefono: string;
        celular: string;
        direccion: string;
      };
      campania: string;
      cupones: number; // Agregar esta propiedad
    }[]
  >([]);
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
  const handleFormaPagoChange = (event: SelectChangeEvent<number>) => {
    setFormaPagoId(Number(event.target.value));
  };
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

  // Función para manejar el clic en el botón Guardar
  const handleGuardar = () => {
    // const cuponesData = CAMPAÑAS_ACTIVAS.filter((campaña) => totalCuponesPorCampaña[campaña.nombre] > 0).map(
    //   (campaña) => ({
    //     logo: 'img/comercioLogo.png',
    //     numCupon: '123456',
    //     hoy: new Date().toLocaleDateString(),
    //     cliente: {
    //       nombre: 'Jean',
    //       apellidos: 'Scala',
    //       ruc: '1234567890',
    //       telefono: '022222222',
    //       celular: '0999999999',
    //       direccion: 'SCALA SHOPPING',
    //     },
    //     campania: campaña.nombre,
    //     cupones: totalCuponesPorCampaña[campaña.nombre],
    //   })
    // );
    // setCuponData(cuponesData);
    // setOpenCouponDialog(true);
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

  const handleImprimirCupon = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupones</title>
            <style>
              @media print {
                @page {
                  size: 72mm 200mm !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .page-container {
                  height: 200mm;
                  position: relative;
                  overflow: hidden;
                }
  
                .coupon {
                  width: 68mm;
                  height: 95mm;
                  padding: 2mm;
                  margin: 2.5mm auto;
                  font-family: 'Arial Narrow', sans-serif;
                  font-size: 8pt;
                  box-sizing: border-box;
                  border: 1px solid #000;
                  position: relative;
                }
  
                .coupon:first-child {
                  margin-top: 5mm;
                }
  
                .coupon:last-child {
                  margin-bottom: 5mm;
                }
  
                .cut-guide {
                  position: absolute;
                  left: 0;
                  right: 0;
                  height: 0;
                  border-top: 1px dashed red;
                  z-index: 999;
                }
  
                .cut-guide-top {
                  top: 100mm;
                }
  
                .cut-guide-bottom {
                  top: 105mm;
                }
  
                img.logo {
                  width: 10mm;
                  margin: 0 auto 2mm;
                  display: block;
                }
                
                h2 {
                  font-size: 5pt;
                  text-align: center;
                  margin: 1mm 0;
                }
  
                .nota {
                  font-size: 7pt;
                  position: absolute;
                  bottom: 2mm;
                  left: 2mm;
                  right: 2mm;
                }
              }
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
                      <strong>Nota:</strong> Favor conservar sus facturas.<br>
                      “El cliente para participar en la promoción confiere voluntariamente sus datos personales, y autoriza a que
                       los mismos sean recopilados y utilizados para las campañas del Centro Comercial, tratados de conformidad con
                       la Ley Orgánica de Protección de Datos Personales. Estos no serán transferidos a terceros. Si el cliente no
                       desea constar en la base de datos del centro comercial, puede solicitar su eliminación al correo
                       info-scala@smo.ec.”
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
  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    return arr.reduce((chunks: T[][], item: T, index: number) => {
      if (index % size === 0) chunks.push([]);
      chunks[chunks.length - 1].push(item);
      return chunks;
    }, []);
  };

  const [cliente, setCliente] = React.useState<Cliente>({
    nombres: '',
    apellidos: '',
    ciRuc: '',
    email: '',
    direccion: '',
    fechaNacimiento: '',
    sexo: '',
    telefono: '',
    celular: '',
    provincia: 'Pichincha',
    ciudad: '',
  });

  const token = localStorage.getItem('custom-auth-token');

  const obtenerClientePorRuc = async (ruc: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes/obtenerCliente?ruc=${ruc}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error al obtener cliente:', data.message);
        return null;
      }

      return data.clienteExistente;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null;
    }
  };

  const handleRucChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const ruc = event.target.value;
    setCliente({ ...cliente, ciRuc: ruc });

    if (ruc.length === 10 || ruc.length === 13) {
      const clienteData = await obtenerClientePorRuc(ruc);

      if (clienteData) {
        setCliente({
          ...cliente,
          nombres: clienteData.nombre,
          apellidos: clienteData.apellidos,
          email: clienteData.email,
          direccion: clienteData.direccion,
          fechaNacimiento: clienteData.fecha_nacimiento,
          telefono: clienteData.telefono,
          celular: clienteData.celular,
          ciRuc: clienteData.ruc,
          sexo: clienteData.sexo || '',
          provincia: clienteData.provincia || 'Pichincha',
          ciudad: clienteData.ciudad || '',
        });
        return;
      }

      setOpenDialog(true);
    }
  };
  const handleGuardarCliente = async () => {
    try {
      const calcularEdad = (fecha: string | Date): number => {
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
        return edad;
      };
      const response = await fetch('http://localhost:5000/api/clientes/isla', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruc: cliente.ciRuc,
          nombre: cliente.nombres,
          apellidos: cliente.apellidos,
          email: cliente.email,
          direccion: cliente.direccion,
          fecha_nacimiento:
            typeof cliente.fechaNacimiento === 'string'
              ? cliente.fechaNacimiento
              : (cliente.fechaNacimiento as Date).toISOString().split('T')[0],
          telefono: cliente.telefono,
          celular: cliente.celular,
          ciudad_id: 189, // puedes hacerlo dinámico si gustas
          provincia_id: 12, // puedes hacerlo dinámico si gustas
          sexo: cliente.sexo === 'Masculino' ? 1 : cliente.sexo === 'Femenino' ? 2 : null,
          edad: calcularEdad(cliente.fechaNacimiento),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cliente guardado correctamente');
        setOpenDialog(false);
      } else {
        alert(`Error: ${data.message || 'No se pudo guardar el cliente'}`);
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const agregarFactura = () => {
    console.log('ingresa factura');
    console.log('Valores faltantes:');
    console.log('saldo:', saldo);
    console.log('selectedPromocion:', selectedPromocion);
    console.log('selectedCampania:', selectedCampania);
    console.log('formaPagoId:', formaPagoId);
    if (!selectedPromocion || !selectedCampania || !formaPagoId) return;

    const formaPago = formasPago.find((fp) => fp.id === formaPagoId);
    const factor = formaPago?.factor || 1;
    const montoFactura = Number(monto);
    const saldoNumerico = Number(saldo);
    const montoMinimo = Number(selectedPromocion.montominimo);
    const total = saldoNumerico + montoFactura;
    const cantidadCupones = Math.floor(total / montoMinimo) * factor;
    const nuevoSaldo = total % montoMinimo;

    const nuevaFactura: Factura = {
      local,
      factura: facturaNum,
      pago: formaPago?.nombre,
      promocion: selectedPromocion.nombre,
      monto,
      campania: selectedCampania.nombre,
      montoMinimo: montoMinimo,
      saldoAnterior: saldoNumerico,
      montoConFactor: montoFactura,
      cupones: cantidadCupones,
      total: total,
      nuevoSaldo: nuevoSaldo,
    };

    const nuevasFacturas = [...facturas, nuevaFactura];
    setFacturas(nuevasFacturas);
    console.log(nuevasFacturas);
  };

  const eliminarFactura = (index: number) => {
    //setFacturas(facturas.filter((_, i) => i !== index));
  };

  // Calculamos el total de montos y cupones por campaña
  // const totalMonto = facturas.reduce((acc, f) => acc + f.monto, 0);
  // const totalCuponesPorCampaña = CAMPAÑAS_ACTIVAS.reduce(
  //   (acc, campaña) => {
  //     acc[campaña.nombre] = facturas.reduce((sum, f) => sum + (f.cupones[campaña.nombre] || 0), 0);
  //     return acc;
  //   },
  //   {} as { [campaña: string]: number }
  // );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Nueva Factura
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="R.U.C." variant="outlined" onChange={handleRucChange} />
        </Grid>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombres"
                  variant="outlined"
                  value={cliente.nombres}
                  onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  variant="outlined"
                  value={cliente.apellidos}
                  onChange={(e) => setCliente({ ...cliente, apellidos: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="C.I./R.U.C." variant="outlined" value={cliente.ciRuc} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  variant="outlined"
                  value={cliente.email}
                  onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dirección/Sector"
                  variant="outlined"
                  value={cliente.direccion}
                  onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Nacimiento"
                  variant="outlined"
                  placeholder="AAAA-MM-DD"
                  value={cliente.fechaNacimiento}
                  onChange={(e) => setCliente({ ...cliente, fechaNacimiento: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  labelId="sexo-label"
                  value={cliente.sexo}
                  label="Sexo"
                  onChange={(e) => setCliente({ ...cliente, sexo: e.target.value })}
                >
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  variant="outlined"
                  value={cliente.telefono}
                  onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Celular"
                  variant="outlined"
                  value={cliente.celular}
                  onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Provincia" variant="outlined" value="Pichincha" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Ciudad" variant="outlined" value="Quito" disabled />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleGuardarCliente}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={cliente.nombres}
            onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Apellido"
            variant="outlined"
            value={cliente.apellidos}
            onChange={(e) => setCliente({ ...cliente, apellidos: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Correo"
            type="email"
            variant="outlined"
            value={cliente.email}
            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Dirección"
            variant="outlined"
            value={cliente.direccion}
            onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Teléfono"
            variant="outlined"
            value={cliente.telefono}
            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Celular"
            variant="outlined"
            value={cliente.celular}
            onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
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
        <Grid item xs={12} sm={3}>
          <Select fullWidth value={local} onChange={(e) => setLocal(e.target.value)}>
            <MenuItem value="ADIDAS">ADIDAS</MenuItem>
            <MenuItem value="NIKE">NIKE</MenuItem>
            <MenuItem value="PUMA">PUMA</MenuItem>
          </Select>
        </Grid>
        {selectedPromocion && (
          <Grid item xs={12} sm={3}>
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
          <TextField
            fullWidth
            label="Monto"
            type="number"
            variant="outlined"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Número de Factura"
            variant="outlined"
            value={facturaNum}
            onChange={(e) => setFacturaNum(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button fullWidth variant="contained" onClick={agregarFactura}>
            + AGREGAR
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Local</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Factura</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Cupones</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((factura, index) => (
              <TableRow key={index}>
                <TableCell>{factura.local}</TableCell>
                <TableCell>{factura.pago}</TableCell>
                <TableCell>{factura.factura}</TableCell>
                <TableCell>{factura.monto}</TableCell>
                <TableCell>{factura.cupones}</TableCell>
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
      <TableContainer component={Paper} sx={{ mt: 3, border: '2px solid red' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Promoción</TableCell>
              <TableCell>Monto Mín.</TableCell>
              <TableCell>Saldo Ant.</TableCell>
              <TableCell>Fac. Monto</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>campania</TableCell>
              <TableCell>Saldo Nue.</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((factura, index) => (
              <TableRow key={index}>
                <TableCell>{factura.promocion}</TableCell>
                <TableCell>{factura.montoMinimo}</TableCell>
                <TableCell>{factura.saldoAnterior}</TableCell>
                <TableCell>{factura.monto}</TableCell>
                <TableCell>{factura.total}</TableCell>
                <TableCell>{factura.campania}</TableCell>
                <TableCell>{factura.nuevoSaldo}</TableCell>
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
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" sx={{ mr: 1 }}>
          Cancelar
        </Button>
        <Button variant="contained" color="primary" sx={{ mr: 1 }}>
          Nuevo
        </Button>
        <Button variant="contained" color="success" onClick={handleGuardar}>
          Guardar
        </Button>
      </Box>
      <Dialog open={openCouponDialog} onClose={() => setOpenCouponDialog(false)} maxWidth="md">
        <DialogTitle>Cupón Generado</DialogTitle>
        <DialogContent>
          {cuponData.map((data, index) => (
            <Coupon
              key={index}
              logo={data.logo}
              numCupon={data.numCupon}
              hoy={data.hoy}
              cliente={data.cliente}
              campania={data.campania}
              cupones={data.cupones}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCouponDialog(false)}>Cerrar</Button>
          <Button variant="contained" color="primary" onClick={handleImprimirCupon}>
            Imprimir Cupón
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
