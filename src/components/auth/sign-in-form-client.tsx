'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { isCedulaEcuador, isPasaporte, isRucEcuador } from '@/utils/validationCI';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import Link from '@mui/material/Link';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import axiosClient from '@/lib/axiosClient';
import { useUser } from '@/hooks/use-user';

import { NewClientForm } from './new-client.form';

const schema = zod.object({
  ruc: zod.string().min(10, { message: 'Campo requerido' }),
  password: zod.string().min(1, { message: 'Campo requerido' }),
});

type Values = zod.infer<typeof schema>;

export function SignInFormClient(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [clienteState, setClienteState] = React.useState<null | { estado: number }>({ estado: 0 });
  const [openDialog, setOpenDialog] = React.useState(false);
  const [cliente, setCliente] = React.useState<{ ciRuc: string }>({ ciRuc: '' });
  const [validado, setValidado] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { ruc: '', password: '' },
  });

  const rucValue = watch('ruc');

  const handleValidarRuc = async () => {
    if (!rucValue) {
      setError('ruc', { message: 'Debe ingresar su número de identificación' });
      return;
    }
    const isValid = isCedulaEcuador(rucValue) || isRucEcuador(rucValue) || isPasaporte(rucValue);

    if (!isValid) {
      setError('ruc', { message: 'Identificación inválida' });
      return;
    }

    try {
      setIsPending(true);
      const res = await axiosClient.post('/api/auth/validarCliente', { ruc: rucValue });

      const data = res.data;
      setClienteState(data);
      setCliente({ ciRuc: rucValue });
      setValidado(true);
    } catch (err: any) {
      console.error('Error al validar cliente:', err);
      if (err.response.data.estado === 2) {
        setOpenDialog(true);
      }
    } finally {
      setIsPending(false);
    }
  };
  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signInClientWithPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      await checkSession?.();

      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={3}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
        }}
      >
        Iniciar Sesión
      </Typography>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="ruc"
            render={({ field }) => (
              <FormControl error={Boolean(errors.ruc)}>
                <InputLabel>C.I. / Pasaporte</InputLabel>
                <OutlinedInput {...field} label="C.I./ Pasaporte" />
                <Typography variant="caption" color="text.secondary">
                  * Recuerda si tienes pasaporte anteponer la letra P *
                </Typography>
                {errors.ruc && (
                  <Typography variant="caption" color="error">
                    {errors.ruc.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
          {!validado && (
            <Button variant="outlined" onClick={handleValidarRuc} disabled={isPending}>
              {isPending ? <CircularProgress size={20} /> : 'Siguiente'}
            </Button>
          )}

          {(clienteState?.estado === 1 || clienteState?.estado === 3) && (
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <FormControl error={Boolean(errors.password)}>
                  <InputLabel>Contraseña</InputLabel>
                  <OutlinedInput
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      showPassword ? (
                        <Eye onClick={() => setShowPassword(false)} />
                      ) : (
                        <EyeSlash onClick={() => setShowPassword(true)} />
                      )
                    }
                  />
                  {errors.password && (
                    <Typography variant="caption" color="error">
                      {errors.password.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}

          {(clienteState?.estado === 1 || clienteState?.estado === 3) && (
            <>
              <div>
                <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
                  Olvidaste tu Contraseña?
                </Link>
              </div>
              <Button type="submit" variant="contained" disabled={isPending}>
                {isPending ? <CircularProgress size={20} /> : 'Ingresar'}
              </Button>
            </>
          )}
          {clienteState?.estado === 1 && (
            <Alert severity="info">
              Usted fue registrado en la isla de atención al cliente del centro comercial. Su clave es su número de
              identificación. Recomendamos cambiarla en el módulo Perfil → Cambiar contraseña.
            </Alert>
          )}
        </Stack>
      </form>

      <NewClientForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        ciRuc={rucValue}
        setClienteState={setClienteState}
        onSubmitAfterCreate={onSubmit}
      />
    </Stack>
  );
}
