'use client';

import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  keyframes,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, FilePlus, XSquare } from '@phosphor-icons/react';

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;


interface FormData {
  campaña: string;
  local: string;
  numeroFactura: string;
  monto: number;
  formaPago: string;
  headerImage: File | null;
  headerPreview: string;
  voucherImage: File | null;
  voucherPreview: string;
  aceptaTerminos: boolean;
}
interface ProcessedFormData extends Omit<FormData, 'headerImage' | 'voucherImage'> {
  headerImage: string;
  voucherImage: string;
}

// Actualizar las props del diálogo
interface FacturaDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ProcessedFormData) => void; // Debe usar ProcessedFormData
}

const StyledButton = styled(Button)(({ theme, colorvariant }: { theme?: any; colorvariant: string }) => ({
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius * 4,
  boxShadow: theme.shadows[6],
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  border: '3px solid',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '&:before': {
      opacity: 0.1,
    },
    '& .iconWrapper': {
      backgroundColor: theme.palette.common.white,
      boxShadow: theme.shadows[4],
    },
    '& .icon': {
      animation: `${floatAnimation} 2s ease-in-out infinite`,
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, currentColor 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 300ms ease',
  },
}));

const IconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '50%',
  transition: 'all 300ms ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledIcon = styled('div')({
  transition: 'transform 300ms ease',
  '& svg': {
    width: 56,
    height: 56,
    strokeWidth: 1.5,
  },
});

const FacturaDialog = ({ open, onClose, onSubmit }: FacturaDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    campaña: '',
    local: '',
    numeroFactura: '',
    monto: 0.0,
    formaPago: '',
    headerImage: null,
    headerPreview: '',
    voucherImage: null,
    voucherPreview: '',
    aceptaTerminos: false,
  });

 
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;

    if (name === 'headerImage' || name === 'voucherImage') {
      const input = target;

      // Validación segura para evitar el error ts18047
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

        if (!allowedTypes.includes(file.type)) {
          alert('Solo se permiten archivos PNG, JPG o JPEG');
          return;
        }

        const previewURL = URL.createObjectURL(file);

        setFormData((prev) => ({
          ...prev,
          [name]: file,
          [`${name === 'headerImage' ? 'headerPreview' : 'voucherPreview'}`]: previewURL,
        }));
      }
    } else {
      const value = name === 'aceptaTerminos' ? target.checked : target.value;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // const handleSubmit = () => {
  //   onSubmit(formData);
  //   onClose();
  // };
  
  const handleSubmit = async () => {
    const convertToBase64 = (file: File | null): Promise<string> => {
      if (!file) return Promise.resolve('');
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };
  
    const processedData: ProcessedFormData = {
      ...formData,
      headerImage: await convertToBase64(formData.headerImage),
      voucherImage: await convertToBase64(formData.voucherImage),
    };
  
    onSubmit(processedData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registro de Nueva Factura</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Campaña</InputLabel>
              <Select name="campaña" value={formData.campaña} onChange={handleChange} label="Campaña">
                <MenuItem value="camp1">Campaña 1</MenuItem>
                <MenuItem value="camp2">Campaña 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Local" name="local" value={formData.local} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número de Factura (últimos 6 dígitos)"
              name="numeroFactura"
              value={formData.numeroFactura}
              onChange={handleChange}
              inputProps={{ maxLength: 6 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monto"
              name="monto"
              type="number"
              value={formData.monto}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Forma de Pago</InputLabel>
              <Select name="formaPago" value={formData.formaPago} onChange={handleChange} label="Forma de Pago">
                <MenuItem value="tarjeta">Tarjeta de Crédito</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="contained" component="label">
              Subir Cabecera de Factura
              <input
                type="file"
                hidden
                name="headerImage"
                accept="image/png, image/jpg, image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0]; // ✅ prevención de ts18047
                  if (file && ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                    const imageURL = URL.createObjectURL(file);
                    setFormData((prev) => ({
                      ...prev,
                      headerImage: file,
                      headerPreview: imageURL,
                    }));
                  } else if (file) {
                    alert('Solo se permiten archivos PNG, JPG o JPEG');
                  }
                }}
              />
            </Button>

            {formData.headerImage && (
              <>
                <span>{formData.headerImage.name}</span>
                <br />
                <img
                  src={formData.headerPreview}
                  alt="Vista previa cabecera"
                  style={{ maxWidth: '100%', maxHeight: 150, marginTop: 10 }}
                />
              </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Button variant="contained" component="label">
              Subir Voucher de Pago
              <input
                type="file"
                hidden
                name="voucherImage"
                accept="image/png, image/jpg, image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0]; // ✅ prevención de ts18047
                  if (file && ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                    const imageURL = URL.createObjectURL(file);
                    setFormData((prev) => ({
                      ...prev,
                      voucherImage: file,
                      voucherPreview: imageURL,
                    }));
                  } else if (file) {
                    alert('Solo se permiten archivos PNG, JPG o JPEG');
                  }
                }}
              />
            </Button>
            {formData.voucherImage && (
              <>
                <span>{formData.voucherImage.name}</span>
                <br />
                <img
                  src={formData.voucherPreview}
                  alt="Vista previa voucher"
                  style={{ maxWidth: '100%', maxHeight: 150, marginTop: 10 }}
                />
              </>
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} />}
              label="Acepto Términos y Condiciones"
            />
            <Typography variant="body2" align="center" sx={{ mt: 1, px: 2 }}>
              Nota: Favor conservar sus facturas. <br />
              “El cliente para participar en la promoción confiere voluntariamente sus datos personales, y autoriza a
              que los mismos sean recopilados, utilizados para las campañas que realice el Centro Comercial y tratados
              de conformidad con lo estipulado en la Ley Orgánica de Protección de Datos Personales, éstos no serán
              transferidos a terceros. En caso de que el cliente no desee constar en la base de datos del centro
              comercial, solicitará su eliminación al correo
              <strong> info-scala@smo.ec</strong>.”
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!formData.aceptaTerminos} variant="contained">
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BotonesFactura = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // const handleSubmitFactura = async (formData: FormData) => {
  //   try {
  //     const token = localStorage.getItem('custom-auth-token');
  //     const cliente_id = localStorage.getItem('id');
  //     const ruc = localStorage.getItem('ruc');
  //     console.log("Cliente ID:", cliente_id); // Verifica que el cliente_id esté correcto
  //     console.log("RUC:", ruc); // Verifica que el ruc esté correcto
  //     // Simulación de las campañas seleccionadas, puedes reemplazar esto dinámicamente
  //     const campañasSeleccionadas = [
  //       {
  //         id: 1,
  //         factura: {
  //           numero: formData.numeroFactura,
  //           monto: formData.monto,
  //           tienda_id: parseInt(formData.local), // Asegúrate de que `local` sea un ID válido
  //           formapago_id: formData.formaPago === 'tarjeta' ? 4 : 3, // Ajusta según tus reglas
  //           imagen: formData.headerImage?.name || '',
  //           voucher: formData.voucherImage?.name || '',
  //         }
  //       }
  //     ];
  
  //     const payload = {
  //       facturasCliente: {
  //         cliente_id: cliente_id, // Puedes obtenerlo desde tu sesión si es dinámico
  //         ruc: ruc, // Lo mismo aquí
  //         campanias: campañasSeleccionadas
  //       }
  //     };
  
  //     const response = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/api/facturas/facturasWeb`, {
       
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`Error del servidor: ${response.status}`);
  //     }
  
  //     const result = await response.json();
  //     console.log('Respuesta del backend:', result);
  //     alert('Factura registrada correctamente.');
  //   } catch (error) {
  //     console.error('Error al registrar factura:', error);
  //     alert('Ocurrió un error al enviar la factura.');
  //   }
  // };
  
  const handleSubmitFactura = async (formData: ProcessedFormData) => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const userString = localStorage.getItem('user');
      
      if (!userString) {
        throw new Error('Usuario no autenticado');
      }
      
      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const ruc = user.ruc;
    
      const campañasSeleccionadas = [
        {
          id: 1,
          factura: {
            numero: formData.numeroFactura,
            monto: formData.monto,
            tienda_id: parseInt(formData.local),
            formapago_id: formData.formaPago === 'tarjeta' ? 4 : 3,
            imagen: formData.headerImage,
            voucher: formData.voucherImage,
          }
        }
      ];
  
      const payload = {
        facturasCliente: {
          cliente_id: cliente_id,
          ruc: ruc,
          campanias: campañasSeleccionadas
        }
      };
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facturas/facturasWeb`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error del servidor');
      }
  
      const result = await response.json();
      console.log('Respuesta del backend:', result);
      alert('Factura registrada correctamente.');
    } catch (error) {
      console.error('Error al registrar factura:', error);
    }
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)',
        p: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={4} sx={{ maxWidth: 1200, margin: 'auto' }}>
        <Grid item xs={12} md={4}>
          <StyledButton colorvariant="blue" onClick={() => setDialogOpen(true)}>
            <IconWrapper className="iconWrapper">
              <StyledIcon className="icon">
                <FilePlus weight="duotone" />
              </StyledIcon>
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Registrar Nueva Factura
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledButton colorvariant="green">
            <IconWrapper className="iconWrapper">
              <StyledIcon className="icon">
                <CheckCircle weight="fill" />
              </StyledIcon>
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Aprobadas
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledButton colorvariant="red">
            <IconWrapper className="iconWrapper">
              <StyledIcon className="icon">
                <XSquare weight="duotone" />
              </StyledIcon>
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Pendientes
            </Typography>
          </StyledButton>
        </Grid>
      </Grid>

      <FacturaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmitFactura} />
    </Box>
  );
};

export default BotonesFactura;
