'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  useTheme,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CheckCircle, ClockClockwise, FilePlus, UserCircle, XSquare, PaperPlane, Invoice } from '@phosphor-icons/react'; // Asegúrate de importar el ícono
import axiosClient from '@/lib/axiosClient';

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;
interface FacturaAprobada {
  id: number;
  fecha_registro: string;
  campania: string;
  local: string;
  numero_factura: string;
  monto: number;
  forma_pago: string;
  cabecera_image: string;
  voucher_image: string;
  estado: string;
  cupones: number;
  observacion: string;
}
interface Factura {
  id: number;
  fechaRegistro: string; // o Date si ya viene como objeto Date
  numero: string;
  monto: number;
  formapago_id: number;
  imagen: string;
  voucher: string;
  estado: number;
  observacion?: string;
  campanias?: {
    nombre: string;
  };
  tienda?: {
    nombre: string;
    numcupones?: number;
  };
}

interface AprobadasDialogProps {
  open: boolean;
  onClose: () => void;
}
interface PendienteDialogProps {
  open: boolean;
  onClose: () => void;
}
interface RechazadasDialogProps {
  open: boolean;
  onClose: () => void;
}

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

const getFormaPagoNombre = (id: number): string => {
  const formas: { [key: number]: string } = {
    1: 'Efectivo',
    2: 'Tarjeta Crédito',
    3: 'Transferencia',
    4: 'Tarjeta Débito',
  };
  return formas[id] || `ID ${id}`;
};

const getEstadoNombre = (estado: number): string => {
  const estados: { [key: number]: string } = {
    1: 'Pendiente',
    2: 'Aprobada',
    3: 'Rechazada',
  };
  return estados[estado] || `Estado ${estado}`;
};

const StyledButton = styled(Button)(({ theme, colorvariant }: { theme?: any; colorvariant: string }) => ({
  width: '100%', // se adapta al contenedor del Grid
  minHeight: '220px',
  maxWidth: '250px', // evita que crezca indefinidamente
  margin: '0 auto', // centra horizontalmente
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  //gap: theme.spacing(2),
  textAlign: 'center',
  border: '3px solid',
  borderColor:
    colorvariant === 'blue'
      ? theme.palette.primary.main
      : colorvariant === 'green'
        ? theme.palette.success.main
        : theme.palette.error.main,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#fff',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    '&:before': {
      opacity: 0.1,
    },
    '& .iconWrapper': {
      backgroundColor: theme.palette.common.white,
      boxShadow: theme.shadows[4],
    },
    '& .icon': {
      animation: `float 2s ease-in-out infinite`,
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
const AprobadasDialog = ({ open, onClose }: AprobadasDialogProps) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const theme = useTheme();
  const [aprobadasData, setAprobadasData] = useState<FacturaAprobada[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 3;

  const fetchAprobadas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('custom-auth-token');
      const userString = localStorage.getItem('user');

      if (!userString) throw new Error('Usuario no autenticado');

      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const cedula = user.ruc;
      console.log(cliente_id);

      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=2&campania_id=1&page=${currentPage}&limit=${pageSize}&cliente_id=${cliente_id}`
      );

      const mappedData = response.data.data.map((factura: Factura) => ({
        id: factura.id,
        fecha_registro: factura.fechaRegistro,
        campania: factura.campanias?.nombre || '',
        local: factura.tienda?.nombre || '',
        numero_factura: factura.numero,
        monto: factura.monto,
        forma_pago: getFormaPagoNombre(factura.formapago_id), // crea una función para traducir el ID
        cabecera_image: factura.imagen,
        voucher_image: factura.voucher,
        estado: getEstadoNombre(factura.estado), // opcional: mapea el estado a string legible
        cupones: factura.tienda?.numcupones || 0,
        observacion: factura.observacion || '',
      }));

      setAprobadasData(mappedData); // usamos el mapeado
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchAprobadas();
  }, [open, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Facturas Aprobadas</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" p={2}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Fecha y hora de registro</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Factura</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Forma de pago</TableCell>
                    <TableCell>Cabecera factura</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cupones</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aprobadasData.map((factura, index) => (
                    <TableRow key={factura.id}>
                      <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell>{new Date(factura.fecha_registro).toLocaleString()}</TableCell>
                      <TableCell>{factura.campania}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>{factura.numero_factura}</TableCell>
                      <TableCell>${factura.monto}</TableCell>
                      <TableCell>{factura.forma_pago}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={factura.cabecera_image}
                          alt="Cabecera"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedImage(factura.cabecera_image);
                            setOpenImageDialog(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={factura.voucher_image}
                          alt="Cabecera"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedImage(factura.voucher_image);
                            setOpenImageDialog(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>{factura.estado}</TableCell>
                      <TableCell>{factura.cupones}</TableCell>
                      <TableCell>{factura.observacion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </DialogContent>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
const PendienteDialog = ({ open, onClose }: PendienteDialogProps) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const theme = useTheme();
  const [pendientesData, setPendientesData] = useState<FacturaAprobada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 3;

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('custom-auth-token');
      const userString = localStorage.getItem('user');

      if (!userString) throw new Error('Usuario no autenticado');

      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const cedula = user.ruc;
      console.log(cliente_id);

      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=1&campania_id=1&page=${currentPage}&limit=${pageSize}&cliente_id=${cliente_id}`
      );

      const mappedData = response.data.data.map((factura: Factura) => ({
        id: factura.id,
        fecha_registro: factura.fechaRegistro,
        campania: factura.campanias?.nombre || '',
        local: factura.tienda?.nombre || '',
        numero_factura: factura.numero,
        monto: factura.monto,
        forma_pago: getFormaPagoNombre(factura.formapago_id), // crea una función para traducir el ID
        cabecera_image: factura.imagen,
        voucher_image: factura.voucher,
        estado: getEstadoNombre(factura.estado), // opcional: mapea el estado a string legible
        cupones: factura.tienda?.numcupones || 0,
        observacion: factura.observacion || '',
      }));

      setPendientesData(mappedData); // usamos el mapeado
      setTotalPages(Math.ceil(response.data.data.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPendientes();
  }, [open, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Facturas Pendientes</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" p={2}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Fecha y hora de registro</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Factura</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Forma de pago</TableCell>
                    <TableCell>Cabecera factura</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cupones</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendientesData.map((factura, index) => (
                    <TableRow key={factura.id}>
                      <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell>{new Date(factura.fecha_registro).toLocaleString()}</TableCell>
                      <TableCell>{factura.campania}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>{factura.numero_factura}</TableCell>
                      <TableCell>${factura.monto}</TableCell>
                      <TableCell>{factura.forma_pago}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={factura.cabecera_image}
                          alt="Cabecera"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedImage(factura.cabecera_image);
                            setOpenImageDialog(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={factura.voucher_image}
                          alt="Cabecera"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedImage(factura.voucher_image);
                            setOpenImageDialog(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>{factura.estado}</TableCell>
                      <TableCell>{factura.cupones}</TableCell>
                      <TableCell>{factura.observacion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
const RechazadasDialog = ({ open, onClose }: RechazadasDialogProps) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const theme = useTheme();
  const [rechazadasData, setRechazadasData] = useState<FacturaAprobada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 3;

  const fetchRechazadas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('custom-auth-token');
      const userString = localStorage.getItem('user');

      if (!userString) throw new Error('Usuario no autenticado');

      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const cedula = user.ruc;
      console.log(cliente_id);

      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=4&campania_id=1&page=${currentPage}&limit=${pageSize}&cliente_id=${cliente_id}`);

      const mappedData = response.data.data.map((factura: Factura) => ({
        id: factura.id,
        fecha_registro: factura.fechaRegistro,
        campania: factura.campanias?.nombre || '',
        local: factura.tienda?.nombre || '',
        numero_factura: factura.numero,
        monto: factura.monto,
        forma_pago: getFormaPagoNombre(factura.formapago_id), // crea una función para traducir el ID
        cabecera_image: factura.imagen,
        voucher_image: factura.voucher,
        estado: getEstadoNombre(factura.estado), // opcional: mapea el estado a string legible
        cupones: factura.tienda?.numcupones || 0,
        observacion: factura.observacion || '',
      }));

      setRechazadasData(mappedData); // usamos el mapeado
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchRechazadas();
  }, [open, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Facturas Rechazadas</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" p={2}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Fecha y hora de registro</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Factura</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Forma de pago</TableCell>
                    <TableCell>Cabecera factura</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cupones</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rechazadasData.map((factura, index) => (
                    <TableRow key={factura.id}>
                      <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell>{new Date(factura.fecha_registro).toLocaleString()}</TableCell>
                      <TableCell>{factura.campania}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>{factura.numero_factura}</TableCell>
                      <TableCell>${factura.monto}</TableCell>
                      <TableCell>{factura.forma_pago}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={factura.cabecera_image}
                          alt="Cabecera"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedImage(factura.cabecera_image);
                            setOpenImageDialog(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={factura.voucher_image}
                          alt="Cabecera"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedImage(factura.voucher_image);
                            setOpenImageDialog(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>{factura.estado}</TableCell>
                      <TableCell>{factura.cupones}</TableCell>
                      <TableCell>{factura.observacion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
const BotonesFactura = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aprobadasOpen, setAprobadasOpen] = useState(false);
  const [pendientesOpen, setPendientesOpen] = useState(false);
  const [rechazadasOpen, setRechazadasOpen] = useState(false);
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
          },
        },
      ];

      const payload = {
        facturasCliente: {
          cliente_id: cliente_id,
          ruc: ruc,
          campanias: campañasSeleccionadas,
        },
      };

      const response = await axiosClient.post(`/api/facturas/facturasWeb`, {
        payload
      });

      const result = await response.data;
      console.log('Respuesta del backend:', result);
      alert('Factura registrada correctamente.');
    } catch (error) {
      console.error('Error al registrar factura:', error);
    }
  };
  return (
    <Box
      sx={{
        minHeight: '60vh',
        background: 'linear-gradient(to bottom right,rgb(255, 255, 255) 0%, #ffffff 100%)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: ' center',
        textAlign: 'center'
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Invoice size={32} />
          Administración de Facturas
        </Typography>
        <Divider sx={{ marginBottom: 3 }} />
      </Box>

      <Grid
        container
        spacing={4}
        sx={{
          maxWidth: 1200,
          margin: 'auto',
          justifyContent: 'center',
          textAlign: 'center',
        }}
        justifyContent="center"
        alignItems="stretch"
      >
        <Grid item xs={12} sm={6} md={3} lg={3} sx={{ borderColor: 'red' }}>
          <StyledButton colorvariant="blue" onClick={() => setDialogOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/ingresar.png"
                alt="Facturas Ingreso"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain',
                  marginBottom: '8px'
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Registrar Nueva Factura
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StyledButton colorvariant="green" onClick={() => setAprobadasOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/aprobada.png"
                alt="Facturas Aprobadas"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Aprobadas
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StyledButton colorvariant="red" onClick={() => setPendientesOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/pendiente.png"
                alt="Facturas Pendientes"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Pendientes
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StyledButton colorvariant="red" onClick={() => setRechazadasOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/rechazada.png"
                alt="Facturas Rechazadas"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Rechazadas
            </Typography>
          </StyledButton>
        </Grid>
      </Grid>
      <FacturaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmitFactura} />
      <AprobadasDialog open={aprobadasOpen} onClose={() => setAprobadasOpen(false)} />
      <PendienteDialog open={pendientesOpen} onClose={() => setPendientesOpen(false)} />
      <RechazadasDialog open={rechazadasOpen} onClose={() => setRechazadasOpen(false)} />
    </Box>
  );
};

export default BotonesFactura;
