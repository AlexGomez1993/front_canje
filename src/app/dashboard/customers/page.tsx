'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
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

import Coupon from '../coupon/page';

interface Factura {
  local: string;
  pago: string;
  factura: string;
  monto: number;
  cupones: { [campaña: string]: number }; // Cupones por campaña
  montoMinimo: number;
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

export default function FacturaForm() {
  const [facturas, setFacturas] = React.useState<Factura[]>([]);
  const [local, setLocal] = React.useState('ADIDAS');
  const [monto, setMonto] = React.useState(50);
  const [montoMinimo, setMontoMinimo] = React.useState(50);
  const [pago, setPago] = React.useState('DINERS CLUB');
  const [facturaNum, setFacturaNum] = React.useState('');
  const [ruc, setRuc] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
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

  // Función para manejar el clic en el botón Guardar
  const handleGuardar = () => {
    const cuponesData = CAMPAÑAS_ACTIVAS.filter((campaña) => totalCuponesPorCampaña[campaña.nombre] > 0).map(
      (campaña) => ({
        logo: 'img/comercioLogo.png',
        numCupon: '123456',
        hoy: new Date().toLocaleDateString(),
        cliente: {
          nombre: 'Jean',
          apellidos: 'Scala',
          ruc: '1234567890',
          telefono: '022222222',
          celular: '0999999999',
          direccion: 'SCALA SHOPPING',
        },
        campania: campaña.nombre,
        cupones: totalCuponesPorCampaña[campaña.nombre],
      })
    );

    setCuponData(cuponesData);
    setOpenCouponDialog(true);
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

  // Concatenar nombres de campañas activas
  const nombresCampañas = CAMPAÑAS_ACTIVAS.map((c) => c.nombre).join(' / ');
  // Concatenar promociones de campañas activas
  const promocionesCampañas = CAMPAÑAS_ACTIVAS.map((c) => c.promoción).join(' / ');
  // Concatenar montos mínimos de campañas activas
  const montosMinimosCampañas = CAMPAÑAS_ACTIVAS.map((c) => c.montoMinimo).join(' / ');

  
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
      }

      setOpenDialog(true);
    }
  };
  const handleGuardarCliente = async () => {
    try {
     // const token = localStorage.getItem('custom-auth-token');

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
          fecha_nacimiento: cliente.fechaNacimiento,
          telefono: cliente.telefono,
          celular: cliente.celular,
          ciudad_id: 189, // puedes hacerlo dinámico si gustas
          provincia_id: 12, // puedes hacerlo dinámico si gustas
          sexo: cliente.sexo === 'Masculino' ? 1 : cliente.sexo === 'Femenino' ? 2 : null,
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
    if (monto > 0 && facturaNum.trim() !== '') {
      const cuponesPorCampaña: { [campaña: string]: number } = {};

      // Calculamos los cupones para cada campaña activa
      CAMPAÑAS_ACTIVAS.forEach((campaña) => {
        cuponesPorCampaña[campaña.nombre] = campaña.calcularCupones(monto, pago);
      });

      const nuevaFactura: Factura = {
        local,
        pago,
        factura: facturaNum,
        monto,
        cupones: cuponesPorCampaña,
        montoMinimo,
      };

      setFacturas([...facturas, nuevaFactura]);
      setFacturaNum(''); // Limpiar campo después de agregar
    }
  };

  const eliminarFactura = (index: number) => {
    setFacturas(facturas.filter((_, i) => i !== index));
  };

  // Calculamos el total de montos y cupones por campaña
  const totalMonto = facturas.reduce((acc, f) => acc + f.monto, 0);
  const totalCuponesPorCampaña = CAMPAÑAS_ACTIVAS.reduce(
    (acc, campaña) => {
      acc[campaña.nombre] = facturas.reduce((sum, f) => sum + (f.cupones[campaña.nombre] || 0), 0);
      return acc;
    },
    {} as { [campaña: string]: number }
  );

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
                <TextField fullWidth label="Nombres" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Apellidos" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="C.I./R.U.C." variant="outlined" value={cliente.ciRuc} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="E-mail" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Dirección/Sector" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Fecha Nacimiento" variant="outlined" placeholder="AAAA-MM-DD" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select fullWidth>
                  <MenuItem value="">Seleccione...</MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Teléfono" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Celular" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Provincia" variant="outlined" defaultValue="Pichincha" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Ciudad" variant="outlined" defaultValue="Quito" disabled />
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
          <TextField
            fullWidth
            label="Campaña"
            variant="outlined"
            value={nombresCampañas} // Mostrar todas las campañas activas
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Promoción"
            variant="outlined"
            value={promocionesCampañas} // Mostrar todas las promociones activas
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select fullWidth value={local} onChange={(e) => setLocal(e.target.value)}>
            <MenuItem value="ADIDAS">ADIDAS</MenuItem>
            <MenuItem value="NIKE">NIKE</MenuItem>
            <MenuItem value="PUMA">PUMA</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Monto Mínimo"
            variant="outlined"
            value={montosMinimosCampañas} // Mostrar todos los montos mínimos
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select fullWidth value={pago} onChange={(e) => setPago(e.target.value)}>
            <MenuItem value="DINERS CLUB">DINERS CLUB (Triple Cupón)</MenuItem>
            <MenuItem value="EFECTIVO">EFECTIVO (1 cupón por $50)</MenuItem>
          </Select>
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
              {CAMPAÑAS_ACTIVAS.map((campaña) => (
                <TableCell key={campaña.nombre}>Cupones {campaña.nombre}</TableCell>
              ))}
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((factura, index) => (
              <TableRow key={index}>
                <TableCell>{factura.local}</TableCell>
                <TableCell>{factura.pago}</TableCell>
                <TableCell>{factura.factura}</TableCell>
                <TableCell>{factura.monto.toFixed(2)}</TableCell>
                {CAMPAÑAS_ACTIVAS.map((campaña) => (
                  <TableCell key={campaña.nombre}>{factura.cupones[campaña.nombre]}</TableCell>
                ))}
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
              {CAMPAÑAS_ACTIVAS.map((campaña) => (
                <TableCell key={campaña.nombre}>Cupones {campaña.nombre}</TableCell>
              ))}
              <TableCell>Saldo Nue.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{promocionesCampañas}</TableCell>
              <TableCell>{montosMinimosCampañas}</TableCell>
              <TableCell>0.00</TableCell>
              <TableCell>{totalMonto.toFixed(2)}</TableCell>
              <TableCell>{totalMonto.toFixed(2)}</TableCell>
              {CAMPAÑAS_ACTIVAS.map((campaña) => (
                <TableCell key={campaña.nombre}>{totalCuponesPorCampaña[campaña.nombre]}</TableCell>
              ))}
              <TableCell>0.00</TableCell>
            </TableRow>
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
