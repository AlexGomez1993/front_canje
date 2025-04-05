// 'use client';

// import * as React from 'react';
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Grid,
//   MenuItem,
//   Paper,
//   Select,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from '@mui/material';

// interface Factura {
//   campaña: string;
//   promoción: string;
//   local: string;
//   pago: string;
//   factura: string;
//   monto: number;
//   cupones: number;
//   montoMinimo: number;
// }
// interface Cliente {
//   nombres: string;
//   apellidos: string;
//   ciRuc: string;
//   email: string;
//   direccion: string;
//   fechaNacimiento: string;
//   sexo: string;
//   telefono: string;
//   celular: string;
//   provincia: string;
//   ciudad: string;
// }
// export default function FacturaForm() {
//   const [facturas, setFacturas] = React.useState<Factura[]>([]);
//   const [local, setLocal] = React.useState('ADIDAS');
//   const [monto, setMonto] = React.useState(50);
//   const [montoMinimo, setMontoMinimo] = React.useState(50);
//   const [pago, setPago] = React.useState('DINERS CLUB');
//   const [facturaNum, setFacturaNum] = React.useState('');
//   const [ruc, setRuc] = React.useState('');
//   const [openDialog, setOpenDialog] = React.useState(false);
//   const [cliente, setCliente] = React.useState<Cliente>({
//     nombres: '',
//     apellidos: '',
//     ciRuc: '',
//     email: '',
//     direccion: '',
//     fechaNacimiento: '',
//     sexo: '',
//     telefono: '',
//     celular: '',
//     provincia: 'Pichincha',
//     ciudad: '',
//   });

//   const calcularCupones = (monto: number, pago: string) => {
//     if (pago === 'DINERS CLUB') {
//       return Math.floor(monto / 50) * 3;
//     }
//     return Math.floor(monto / 50);
//   };
//   const handleRucChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const ruc = event.target.value;
//     setCliente({ ...cliente, ciRuc: ruc });
//     if (ruc.length === 10 || ruc.length === 13) {
//       setOpenDialog(true);
//     }
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   const agregarFactura = () => {
//     if (monto > 0 && facturaNum.trim() !== '') {
//       const nuevaFactura: Factura = {
//         campaña: 'SAN VALENTIN 2025',
//         promoción: 'TODOS LOS LOCALES SAN VALENTIN 2025',
//         local,
//         pago,
//         factura: facturaNum,
//         monto,
//         cupones: calcularCupones(monto, pago),
//         montoMinimo,
//       };
//       setFacturas([...facturas, nuevaFactura]);
//       setFacturaNum(''); // Limpiar campo después de agregar
//     }
//   };

//   const eliminarFactura = (index: number) => {
//     setFacturas(facturas.filter((_, i) => i !== index));
//   };

//   const totalMonto = facturas.reduce((acc, f) => acc + f.monto, 0);
//   const totalCupones = facturas.reduce((acc, f) => acc + f.cupones, 0);

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" align="center" gutterBottom>
//         Nueva Factura
//       </Typography>
//       <Grid container spacing={2}>
//         <Grid item xs={12} sm={6}>
//           <TextField fullWidth label="R.U.C." variant="outlined" onChange={handleRucChange} />
//         </Grid>
//         <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>Nuevo Cliente</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Nombres" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Apellidos" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="C.I./R.U.C." variant="outlined" value={cliente.ciRuc} disabled />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="E-mail" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Dirección/Sector" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Fecha Nacimiento" variant="outlined" placeholder="AAAA-MM-DD" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Select fullWidth>
//                 <MenuItem value="">Seleccione...</MenuItem>
//                 <MenuItem value="Masculino">Masculino</MenuItem>
//                 <MenuItem value="Femenino">Femenino</MenuItem>
//               </Select>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Teléfono" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Celular" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Provincia" variant="outlined" defaultValue="Pichincha" disabled />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Ciudad" variant="outlined" defaultValue="Quito" disabled  />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
//           <Button variant="contained" color="primary">Guardar</Button>
//         </DialogActions>
//       </Dialog>
//         <Grid item xs={12} sm={3}>
//           <TextField fullWidth label="Nombre" variant="outlined" defaultValue="PRUEBAS" />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField fullWidth label="Apellido" variant="outlined" defaultValue="SCALA" />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField fullWidth label="Correo" type="email" variant="outlined" defaultValue="jeanpsv000@gmail.com" />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField fullWidth label="Dirección" variant="outlined" defaultValue="SCALA SHOPPING" />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField fullWidth label="Teléfono" variant="outlined" defaultValue="022222222" />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField fullWidth label="Celular" variant="outlined" defaultValue="0999999999" />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField fullWidth label="Campaña" variant="outlined" defaultValue="SAN VALENTIN 2025" />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             label="Promoción"
//             variant="outlined"
//             defaultValue="TODOS LOS LOCALES SAN VALENTIN 2025"
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <Select fullWidth value={local} onChange={(e) => setLocal(e.target.value)}>
//             <MenuItem value="ADIDAS">ADIDAS</MenuItem>
//             <MenuItem value="NIKE">NIKE</MenuItem>
//             <MenuItem value="PUMA">PUMA</MenuItem>
//           </Select>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             fullWidth
//             label="Monto Mínimo"
//             type="number"
//             variant="outlined"
//             value={montoMinimo}
//             onChange={(e) => setMontoMinimo(Number(e.target.value))}
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <Select fullWidth value={pago} onChange={(e) => setPago(e.target.value)}>
//             <MenuItem value="DINERS CLUB">DINERS CLUB (Triple Cupón)</MenuItem>
//             <MenuItem value="EFECTIVO">EFECTIVO (1 cupón por $50)</MenuItem>
//           </Select>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             fullWidth
//             label="Monto"
//             type="number"
//             variant="outlined"
//             value={monto}
//             onChange={(e) => setMonto(Number(e.target.value))}
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             fullWidth
//             label="Número de Factura"
//             variant="outlined"
//             value={facturaNum}
//             onChange={(e) => setFacturaNum(e.target.value)}
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <Button fullWidth variant="contained" onClick={agregarFactura}>
//             + AGREGAR
//           </Button>
//         </Grid>
//       </Grid>

//       <TableContainer component={Paper} sx={{ mt: 3 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Campaña</TableCell>
//               <TableCell>Promoción</TableCell>
//               <TableCell>Local</TableCell>
//               <TableCell>Pago</TableCell>
//               <TableCell>Factura</TableCell>
//               <TableCell>Monto</TableCell>
//               <TableCell>Eliminar</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {facturas.map((factura, index) => (
//               <TableRow key={index}>
//                 <TableCell>{factura.campaña}</TableCell>
//                 <TableCell>{factura.promoción}</TableCell>
//                 <TableCell>{factura.local}</TableCell>
//                 <TableCell>{factura.pago}</TableCell>
//                 <TableCell>{factura.factura}</TableCell>
//                 <TableCell>{factura.monto.toFixed(2)}</TableCell>
//                 <TableCell>
//                   <Button variant="contained" color="error" onClick={() => eliminarFactura(index)}>
//                     Eliminar
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <TableContainer component={Paper} sx={{ mt: 3, border: '2px solid red' }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Promoción</TableCell>
//               <TableCell>Monto Mín.</TableCell>
//               <TableCell>Saldo Ant.</TableCell>
//               <TableCell>Fac. Monto</TableCell>
//               <TableCell>Total</TableCell>
//               <TableCell>Cupones</TableCell>
//               <TableCell>Saldo Nue.</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             <TableRow>
//               <TableCell>TODOS LOS LOCALES SAN VALENTIN 2025</TableCell>
//               <TableCell>50.00</TableCell>
//               <TableCell>0.00</TableCell>
//               <TableCell>{totalMonto.toFixed(2)}</TableCell>
//               <TableCell>{totalMonto.toFixed(2)}</TableCell>
//               <TableCell>{totalCupones}</TableCell>
//               <TableCell>0.00</TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
//         <Button variant="contained" sx={{ mr: 1 }}>
//           Cancelar
//         </Button>
//         <Button variant="contained" color="primary" sx={{ mr: 1 }}>
//           Nuevo
//         </Button>
//         <Button variant="contained" color="success">
//           Guardar
//         </Button>
//       </Box>
//     </Box>
//   );
// }
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
    const cuponesData = CAMPAÑAS_ACTIVAS.filter(
      (campaña) => totalCuponesPorCampaña[campaña.nombre] > 0
    ).map((campaña) => ({
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
    }));
  
    setCuponData(cuponesData);
    setOpenCouponDialog(true);
  };

  // Función para imprimir el cupón
  // const handleImprimirCupon = () => {
  //   window.print(); // Imprimir el cupón
  // };
  // const handleImprimirCupon = () => {
  //   const printWindow = window.open('', '', 'width=1800,height=800');
  //   if (printWindow) {
  //     printWindow.document.write(`
  //       <html>
  //         <head>
  //           <title>Imprimir Cupón</title>
  //           <style>
  //             @media print {
  //               body { margin: 0; padding: 0; }
  //               .coupon {
  //                 border: 2px dashed #000;
  //                 border-radius: 10px;
  //                 padding: 20px;
  //                 max-width: 400px;
  //                 margin: 20px auto;
  //                 font-family: Arial, sans-serif;
  //               }
  //               button { display: none; }
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           ${cuponData.map(data => `
  //             <div class="coupon">
  //               <div style="text-align: center;">
  //                 <img src="${data.logo}" alt="Logo" style="width: 50px;" />
  //               </div>
  //               <h2 style="text-align: center;">SCALA SHOPPING</h2>
  //               <div>
  //                 <p><strong>NÚMERO DE CUPÓN:</strong> ${data.numCupon}</p>
  //                 <p><strong>FECHA:</strong> ${data.hoy}</p>
  //                 <p><strong>CLIENTE:</strong> ${data.cliente.nombre} ${data.cliente.apellidos}</p>
  //                 <p><strong>CI/RUC:</strong> ${data.cliente.ruc}</p>
  //                 <p><strong>TELÉFONO:</strong> ${data.cliente.telefono}</p>
  //                 <p><strong>CELULAR:</strong> ${data.cliente.celular}</p>
  //                 <p><strong>DIRECCIÓN:</strong> ${data.cliente.direccion}</p>
  //                 <p><strong>CAMPAÑA:</strong> ${data.campania}</p>
  //                 <p><strong>CUPONES:</strong> ${data.cupones}</p>
  //               </div>
  //               <div style="margin-top: 10px;">
  //                 <p><strong>Nota:</strong> Favor conservar sus facturas.</p>
  //                 <p>
  //                   “El cliente para participar en la promoción confiere voluntariamente sus datos personales, y autoriza a que
  //                   los mismos sean recopilados y utilizados para las campañas del Centro Comercial, tratados de conformidad con
  //                   la Ley Orgánica de Protección de Datos Personales. Estos no serán transferidos a terceros. Si el cliente no
  //                   desea constar en la base de datos del centro comercial, puede solicitar su eliminación al correo
  //                   info-scala@smo.ec.”
  //                 </p>
  //               </div>
  //             </div>
  //           `).join('')}
  //         </body>
  //       </html>
  //     `);
  //     printWindow.document.close();
  //     printWindow.print();
  //   }
  // };
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
                  size: 72mm 200mm;  /* Altura para 2 cupones */
                  margin: 0;          /* Eliminar márgenes de la página */
                  padding: 0;
                }
                
                body {
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                }
                
                .page-container {
                  height: 200mm;     /* Altura total del papel */
                  position: relative;
                }
  
                .coupon {
                  width: 68mm;
                  height: 98mm;      /* Altura para medio papel (200mm/2 - 2mm de separación) */
                  border: 1px dashed #000;
                  padding: 2mm;
                  font-family: 'Arial Narrow', sans-serif;
                  font-size: 10px;
                  box-sizing: border-box;
                  overflow: hidden;
                  position: absolute;
                }
  
                .coupon:nth-child(1) {
                  top: 0;
                }
  
                .coupon:nth-child(2) {
                  top: 100mm;      /* Posición del segundo cupón */
                  border-top: none; /* Eliminar borde duplicado */
                }
  
                /* Línea de corte horizontal */
                .cut-line {
                  position: absolute;
                  top: 98mm;       /* Posición justo en la mitad */
                  left: 0;
                  right: 0;
                  border-top: 1px dashed red;
                  z-index: 1;
                }
  
                img.logo {
                  width: 30px !important;
                  margin: 0 auto;
                  display: block;
                }
                
                h2 {
                  font-size: 12px;
                  text-align: center;
                  margin: 2mm 0;
                }
              }
            </style>
          </head>
          <body>
            ${chunkArray(cuponData, 2).map(pair => `
              <div class="page-container">
                ${pair.map(data => `
                  <div class="coupon">
                    <div style="text-align: center; margin-bottom: 2mm;">
                      <img src="${data.logo}" class="logo" alt="Logo">
                    </div>
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
                `).join('')}
                  <div class="cut-line"></div> <!-- Línea de corte -->
              </div>
            `).join('')}
          </body>
        </html>
      `);
  
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    }
  };
  
  // Función para dividir el array en grupos de 2
 // Define la interfaz con las propiedades necesarias
interface CuponData {
  numCupon: string;
  logo: string;
  cliente: {
    nombre: string;
    apellidos: string;
    ruc: string;
    telefono: string;
    celular: string;
    direccion: string;
  };
  campania: string;
  cupones: number;
  hoy: string;
}

// Luego, ajusta la función chunkArray
const chunkArray = (arr: CuponData[], size: number): CuponData[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
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

  const handleRucChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ruc = event.target.value;
    setCliente({ ...cliente, ciRuc: ruc });
    if (ruc.length === 10 || ruc.length === 13) {
      setOpenDialog(true);
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
            <Button variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth label="Nombre" variant="outlined" defaultValue="PRUEBAS" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth label="Apellido" variant="outlined" defaultValue="SCALA" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Correo" type="email" variant="outlined" defaultValue="jeanpsv000@gmail.com" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Dirección" variant="outlined" defaultValue="SCALA SHOPPING" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth label="Teléfono" variant="outlined" defaultValue="022222222" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth label="Celular" variant="outlined" defaultValue="0999999999" />
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
