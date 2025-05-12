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
  IconButton,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { NewClientDialog } from '@/components/dashboard/customer/newClientDialog';
import Coupon from '../coupon/page';
import axiosClient from '@/lib/axiosClient';
import { PaymentMethod, PaymentMethodResponse } from '@/types/payment_method';
import { Campaign, CampaignPromotions, CampaignResponse } from '@/types/campaign';
import { Promotion } from '@/types/promotion';
import { CustomerInvoice, Invoice } from '@/types/invoice';
import { PlusCircle, TipJar, Trash } from '@phosphor-icons/react';
import { Store } from '@/types/comercial_store';
import { CustomerBalance } from '@/types/customerBalance';
import { useUser } from '@/hooks/use-user';

interface Factura {
  local_nombre: string;
  local_id: string;
  formaPago_nombre: string;
  formaPago_id: string;
  numeroFactura: string;
  promocion_nombre: string;
  promocion_id: string;
  campania_nombre: string;
  campania_id: string;
  montoFactura: string;
  saldoAnterior: string;
  cupones: number;
}

export interface Cliente {
  id?: string;
  nombres: string;
  apellidos: string;
  ciRuc: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
  sexo: number;
  telefono: string;
  celular: string;
  provincia: string;
  ciudad: string;
}
interface CampaniaSeleccionada {
  campaniaId: number | '';
  promocionId: number | '';
}

export default function FacturaForm() {
  const { user } = useUser();
  const [facturasIngreso, setFacturasIngreso] = useState<CustomerInvoice>({
    cliente_id: 0,
    usuario_id: 0,
    ruc: '',
    campanias: [],
  });
  const [selectedRows, setSelectedRows] = useState<CampaignPromotions[]>([]);

  const [local, setLocal] = React.useState<string>('0');
  const [monto, setMonto] = React.useState('');
  const [facturaNum, setFacturaNum] = React.useState('');
  const [ruc, setRuc] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [locales, setLocales] = useState<Store[]>([]);
  const [campanias, setCampanias] = useState<Campaign[]>([]);
  const [formasPago, setFormasPago] = useState<PaymentMethod[]>([]);
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
      cupones: number;
    }[]
  >([]);
  const [cliente, setCliente] = React.useState<Cliente>({
    id: '',
    nombres: '',
    apellidos: '',
    ciRuc: '',
    email: '',
    direccion: '',
    fechaNacimiento: '',
    sexo: 0,
    telefono: '',
    celular: '',
    provincia: '',
    ciudad: '',
  });

  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const response = await axiosClient.get<PaymentMethodResponse>(`/api/formasPago?activo=1`);
        setFormasPago(response.data.data);
      } catch (error) {
        console.error('Error al cargar formas de pago:', error);
        setFormasPago([]);
      }
    };

    fetchFormasPago();
  }, []);

  useEffect(() => {
    const fetchCampanias = async () => {
      try {
        const response = await axiosClient.get<CampaignResponse>(`/api/campanias?activo=1`);
        const campaniasActivas: Campaign[] = response.data.data;
        setCampanias(response.data.data || []);
        setLocales(campaniasActivas[0].tiendas || [])
      } catch (error) {
        console.error('Error al cargar campañas:', error);
      }
    };

    fetchCampanias();
  }, []);

  useEffect(() => {
    if (campanias && campanias.length > 0) {
      setSelectedRows([
        {
          campania_id: campanias[0].id || 0,
          campania_nombre: campanias[0].nombre || undefined,
          campania_tipoConfig: campanias[0].configuracion?.descripcion || 0,
          promocion_id: campanias[0].promociones![0].id || 0,
          promocion_nombre: campanias[0].promociones![0].nombre || '',
          promocion_montominimo: campanias[0].promociones![0].montominimo || 0,
          forma_pago: 0,
        }
      ]);
    } else {
      setSelectedRows([]);
    }
  }, [campanias]);
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
  const handleCampaignChange = (index: number, campaignId: number | string) => {
    const campania: Campaign | undefined = campanias.find(c => c.id === campaignId);
    const primeraPromo = campania ? campania.promociones![0] : undefined;
    const newRows = [...selectedRows];
    newRows[index] = {
      campania_id: campania?.id,
      campania_nombre: campania?.nombre,
      campania_tipoConfig: campania?.configuracion?.descripcion,
      promocion_id: primeraPromo?.id,
      promocion_nombre: primeraPromo?.nombre || '',
      promocion_montominimo: primeraPromo?.montominimo || 0,
    };
    setSelectedRows(newRows);
  };
  const handlePromotionChange = (index: number, promocionId: number | string) => {
    const row = selectedRows[index];
    const campania = campanias.find(c => c.id == row.campania_id);
    const promocion = campania?.promociones?.find(p => p.id == promocionId);

    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      promocion_id: promocion?.id,
      promocion_nombre: promocion?.nombre,
      promocion_montominimo: promocion?.montominimo
    };
    setSelectedRows(newRows);
  };

  const handleMethodPayChange = (index: number, formaPagoId: number | string) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      forma_pago: formaPagoId
    };
    setSelectedRows(newRows);
  };
  const addRow = () => {
    setSelectedRows([
      ...selectedRows,
      {
        campania_id: undefined,
        campania_nombre: '',
        campania_tipoConfig: 0,
        promocion_id: undefined,
        promocion_nombre: '',
        promocion_montominimo: 0,
        forma_pago: 0
      }
    ]);
  };

  const removeRow = (index: number) => {
    if (selectedRows.length > 1) {
      const updatedRows = selectedRows.filter((_, i) => i !== index);
      setSelectedRows(updatedRows);
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

  const obtenerClientePorRuc = async (ruc: string) => {
    try {
      const response = await axiosClient.get(`/api/clientes/obtenerCliente?ruc=${ruc}`);

      return response.data.clienteExistente || {};
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
          id: clienteData.id,
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
          ciudad: clienteData.ciudad || 'Quito',
        });
        return;
      }

      setOpenDialog(true);
    }
  };
  console.log('selectedRows', selectedRows)
  const actualizarSaldoInicial = (saldoinicial: number, index: number) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      saldo_inicial: saldoinicial.toString()
    };
    setSelectedRows(newRows);
  }
  const actualizarSaldo = (nuevoSaldo: number, index: number) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      saldo_nuevo: nuevoSaldo.toString()
    };
    setSelectedRows(newRows);
  }
  const actualizarCupones = (nuevosCupones: number, index: number) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      total_cupones: nuevosCupones
    };
    setSelectedRows(newRows);
  }
  /* const agregarFactura = async () => {

    console.log('ingresa factura');
    console.log('selectedCampania:', selectedRows);

    if (!selectedRows) return;
    const saldosCliente: CustomerBalance[] = await axiosClient.post('/api/saldosCliente', { cliente_id: cliente.id })
    const localData = locales.find((l) => l.id == parseInt(local));
    const montoFactura = Number(monto);
    const cuponesLocal = localData?.numcupones
    const user_id = user?.id

    {
      selectedRows.map((c: CampaignPromotions, index) => {
        const formaPago = formasPago.find((fp) => fp.id === c.forma_pago);
        const factor = formaPago?.factor || 1;
        const montoMinimo = Number(c.promocion_montominimo);

        if (c.campania_tipoConfig == 1) {
          const saldoInicialCliente: CustomerBalance | undefined = saldosCliente.find((s) => s.campania_id == c.campania_id && s.promocion_id == c.promocion_id && s.cliente_id == parseInt(cliente.id!))

          var saldoInicialValor = saldoInicialCliente ? parseFloat(saldoInicialCliente.saldo) : 0;
          actualizarSaldoInicial(saldoInicialValor,index)
          var total = saldoInicialValor + montoFactura;
          var cantidadCupones = Math.floor(total / montoMinimo) * factor * parseInt(cuponesLocal!);
          actualizarCupones(cantidadCupones,index)
          var nuevoSaldo = total % montoMinimo;
          actualizarSaldo(nuevoSaldo,index);
        }
        if (c.campania_tipoConfig == 2) {
          var total = montoFactura;
          var cantidadCupones = Math.floor(total / montoMinimo) * factor * parseInt(cuponesLocal!);
          actualizarCupones(cantidadCupones,index)
          saldoInicialValor= 0;
        }

        
        const nuevaFactura: Factura = {
          local_nombre:localData!.nombre,
          local_id:localData!.id.toString(),
          numeroFactura: facturaNum,
          formaPago_nombre: formaPago!.nombre,
          formaPago_id: formaPago!.id.toString(),
          promocion_nombre: c.promocion_nombre!,
          promocion_id: c.promocion_id!.toString(),
          campania_nombre: c.campania_nombre!,
          campania_id: c.campania_id!.toString(),
          montoFactura:monto,
          saldoAnterior: c.saldo_inicial!,
          cupones: c.total_cupones!
        };

        const nuevasFacturas = [...facturasIngreso, nuevaFactura];
        setFacturasIngreso(nuevasFacturas);
        console.log('nuevasFacturas', nuevasFacturas)
      })
    }

  }; */

  const agregarFactura = async () => {
    console.log('ingresa factura');
    console.log('selectedCampania:', selectedRows);

    if (!selectedRows || selectedRows.length === 0) return;

    // Validar que cliente y user estén disponibles
    if (!cliente?.id || !cliente?.ciRuc || !user?.id) {
        console.warn('Cliente o usuario no están disponibles todavía');
        return;
    }

    const localData = locales.find((l) => l.id == parseInt(local));
    const montoFactura = Number(monto);
    const cuponesLocal = localData?.numcupones;
    const user_id = user.id;

    // Clonar el estado actual de facturasIngreso
    let nuevaFacturaIngreso: CustomerInvoice = { ...facturasIngreso };

    // Inicializar si no están asignados
    if (!nuevaFacturaIngreso.cliente_id || nuevaFacturaIngreso.cliente_id === 0) {
        nuevaFacturaIngreso.cliente_id = parseInt(cliente.id);
        nuevaFacturaIngreso.usuario_id = parseInt(user_id);
        nuevaFacturaIngreso.ruc = cliente.ciRuc;
        nuevaFacturaIngreso.campanias = []; // Asegura que esté inicializado
    }

    // Objeto para mantener el saldo actual por cada promoción dentro de la sesión
    const saldoActualPorPromocion: { [key: string]: number } = {};

    for (const c of selectedRows) {
        const formaPago = formasPago.find((fp) => fp.id === c.forma_pago);
        const factor = formaPago?.factor || 1;
        const montoMinimo = Number(c.promocion_montominimo);
        let saldoInicialValor = 0;
        let cantidadCupones = 0;
        let nuevoSaldoCalculado = 0;

        const promocionKey = `${c.campania_id}-${c.promocion_id}`;

        if (c.campania_tipoConfig == 1) {
            // Si ya tenemos un saldo actual para esta promoción, usarlo
            if (saldoActualPorPromocion[promocionKey] !== undefined) {
                saldoInicialValor = saldoActualPorPromocion[promocionKey];
                console.log(`Usando saldo actual para ${promocionKey}:`, saldoInicialValor);
            } else {
                // Si no, obtener el saldo inicial del cliente (solo la primera vez para esta promoción)
                const response = await axiosClient.post('/api/saldosCliente', {
                    cliente_id: cliente.id,
                    campania_id: c.campania_id,
                    promocion_id: c.promocion_id,
                });
                const saldoInicialCliente = response.data.data[0]; // Suponiendo que la API devuelve un array
                saldoInicialValor = saldoInicialCliente ? parseFloat(saldoInicialCliente.saldo) : 0;
                console.log(`Saldo inicial de API para ${promocionKey}:`, saldoInicialValor);
            }
            actualizarSaldoInicial(saldoInicialValor, selectedRows.indexOf(c)); // Mantener la actualización visual

            const total = saldoInicialValor + montoFactura;
            console.log('total', total);

            cantidadCupones = Math.floor(total / montoMinimo) * factor * parseInt(cuponesLocal!);
            console.log('cantidadCupones', cantidadCupones);
            actualizarCupones(cantidadCupones, selectedRows.indexOf(c)); // Mantener la actualización visual

            nuevoSaldoCalculado = Number((total % montoMinimo).toFixed(2));
            console.log('nuevoSaldo', nuevoSaldoCalculado);
            actualizarSaldo(nuevoSaldoCalculado, selectedRows.indexOf(c)); // Mantener la actualización visual

            // Actualizar el saldo actual para la siguiente iteración o adición
            saldoActualPorPromocion[promocionKey] = nuevoSaldoCalculado;
        }

        if (c.campania_tipoConfig == 2) {
            const total = montoFactura;
            cantidadCupones = Math.floor(total / montoMinimo) * factor * parseInt(cuponesLocal!);
            console.log('cantidadCupones', cantidadCupones);
            actualizarCupones(cantidadCupones, selectedRows.indexOf(c));
            saldoInicialValor = 0;
            nuevoSaldoCalculado = 0;
        }

        const nuevaFactura: Invoice = {
            numero: facturaNum,
            monto: monto,
            tienda_id: localData!.id,
            tienda_nombre: localData!.nombre,
            formapago_id: formaPago!.id,
            formapago_nombre: formaPago!.nombre,
            numcupones: cantidadCupones,
        };

        console.log('nuevaFactura', nuevaFactura);

        // Buscar o crear campaña
        let campania = nuevaFacturaIngreso.campanias.find((camp) => camp.id === c.campania_id);
        if (!campania) {
            campania = {
                id: c.campania_id!,
                nombre: c.campania_nombre!,
                tipo_configuracion: Number(c.campania_tipoConfig),
                totalcupones: 0,
                promociones: [],
            };
            nuevaFacturaIngreso.campanias.push(campania);
        }

        // Buscar o crear promoción
        let promocion = campania.promociones.find((p) => p.id === c.promocion_id);
        if (!promocion) {
            promocion = {
                id: c.promocion_id!,
                nombre: c.promocion_nombre!,
                montominimo: c.promocion_montominimo!.toString(),
                nuevoSaldo: "0", // Inicializar
                facturas: [],
            };
            campania.promociones.push(promocion);
        }

        // Actualizar nuevo saldo dentro de la promoción (para la estructura de datos)
        promocion.nuevoSaldo = nuevoSaldoCalculado.toString();

        // Agregar factura
        promocion.facturas.push(nuevaFactura);
        campania.totalcupones += nuevaFactura.numcupones;

        console.log('Factura agregada:', nuevaFactura);
    }

    setFacturasIngreso(nuevaFacturaIngreso);

    // Verificar que el nuevo saldo se guardó correctamente
    console.log('facturasIngreso actualizado:', JSON.stringify(nuevaFacturaIngreso, null, 2));

    // Reset
    setFacturaNum('');
    setMonto('');
    setLocal('0');
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
        <TipJar style={{ marginRight: 8 }} />
        Nueva Factura
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="R.U.C." variant="outlined" onChange={handleRucChange} size='small' />
        </Grid>
        <NewClientDialog openDialog={openDialog} setOpenDialog={setOpenDialog} cliente={cliente} setCliente={setCliente} />

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={cliente.nombres}
            onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })}
            size='small'
            disabled
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Apellido"
            variant="outlined"
            value={cliente.apellidos}
            onChange={(e) => setCliente({ ...cliente, apellidos: e.target.value })}
            size='small'
            disabled
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
            size='small'
            disabled
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Dirección"
            variant="outlined"
            value={cliente.direccion}
            onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
            size='small'
            disabled
          />
        </Grid>
        {selectedRows.map((row: CampaignPromotions, index: number) => {
          const campania = campanias.find((c) => c.id === row.campania_id);

          return (
            <Grid container spacing={2} item xs={12} key={index} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id={`campania-label-${index}`}>Campaña</InputLabel>
                  <Select
                    labelId={`campania-label-${index}`}
                    value={row.campania_id || ''}
                    onChange={(e) => handleCampaignChange(index, e.target.value)}
                    label="Campaña"
                    size="small"
                  >
                    {campanias.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id={`promocion-label-${index}`}>Promoción</InputLabel>
                  <Select
                    labelId={`promocion-label-${index}`}
                    value={row.promocion_id || ''}
                    onChange={(e) => handlePromotionChange(index, e.target.value)}
                    label="Promoción"
                    disabled={!row.campania_id}
                    size="small"
                  >
                    {campania?.promociones?.map((p) => (
                      <MenuItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={1.7}>
                <TextField
                  fullWidth
                  label="Monto Mínimo"
                  variant="outlined"
                  value={`$${Number(row.promocion_montominimo).toFixed(2)}` || 0}
                  disabled
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id={`forma-pago-label-${index}`}>Forma de Pago</InputLabel>
                  <Select
                    labelId={`forma-pago-label-${index}`}
                    value={row.forma_pago || 0}
                    onChange={(e) => handleMethodPayChange(index, e.target.value)}
                    label="Forma de Pago"
                    size="small"
                  >
                    <MenuItem value={0}>
                      Seleccione...
                    </MenuItem>
                    {formasPago.map((fp) => (
                      <MenuItem key={fp.id} value={fp.id}>
                        {fp.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs="auto">
                <Tooltip title="Eliminar campaña">
                  <IconButton
                    onClick={() => removeRow(index)}
                    color="error"
                    size="small"
                  >
                    <Trash size={20} />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs="auto">
                <Tooltip title="Agregar Campaña">
                  <IconButton
                    onClick={() => addRow()}
                    color="secondary"
                    size="small"
                  >
                    <PlusCircle size={20} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          );
        })}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ mt: 0.3 }}>
            <InputLabel id="local-label">Local</InputLabel>
            <Select labelId="local-label" fullWidth value={local} onChange={(e) => setLocal(e.target.value)} size='small' label="Local"
              variant="outlined">
              <MenuItem value='0'>Seleccione</MenuItem>
              {locales.length > 0 && locales?.map((t) => (
                <MenuItem key={t.id} value={t.id.toString()}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Número de Factura"
            variant="outlined"
            value={facturaNum}
            onChange={(e) => setFacturaNum(e.target.value)}
            size='small'
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Monto de la Factura"
            type="number"
            variant="outlined"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            size='small'
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button fullWidth variant="contained" onClick={agregarFactura} size='small'>
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
            {facturasIngreso?.campanias.flatMap((campania, iCampania) =>
              campania.promociones.flatMap((promocion, iPromo) => [
                <TableRow key={`${iCampania}-${iPromo}`}>
                  <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    {campania.nombre} - {promocion.nombre}
                  </TableCell>
                </TableRow>,
                ...promocion.facturas.map((factura, index) => (
                  <TableRow key={`factura-${iCampania}-${iPromo}-${index}`}>
                    <TableCell>{factura.tienda_nombre}</TableCell>
                    <TableCell>{factura.formapago_nombre}</TableCell>
                    <TableCell>{factura.numero}</TableCell>
                    <TableCell>{factura.monto}</TableCell>
                    <TableCell>{factura.numcupones}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => eliminarFactura(index)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                )),
              ])
            )}
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
              {/* <TableCell>Total</TableCell> */}
              <TableCell>campania</TableCell>
              <TableCell>Saldo Nue.</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturasIngreso?.campanias.flatMap((campania, iCampania) =>
              campania.promociones.flatMap((promocion, iPromo) => [
                <TableRow key={`${iCampania}-${iPromo}`}>
                  <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    {campania.nombre} - {promocion.nombre}
                  </TableCell>
                </TableRow>,
                ...promocion.facturas.map((factura, index) => (

                  <TableRow key={`factura-${iCampania}-${iPromo}-${index}`}>
                    <TableCell>{promocion.nombre}</TableCell>
                    <TableCell>{promocion.montominimo}</TableCell>
                    <TableCell>{selectedRows.find((c) => promocion.id == c.promocion_id && campania.id && c.campania_id)?.saldo_inicial}</TableCell>
                    <TableCell>{factura.monto}</TableCell>
                    {/* <TableCell>{factura.monto + saldo}</TableCell> */}
                    <TableCell>{campania.nombre}</TableCell>
                    <TableCell>{promocion.nuevoSaldo}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => eliminarFactura(index)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>

                )),
              ])
            )}
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
