'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import axiosClient from '@/lib/axiosClient';

const schema = zod.object({
  email: zod.string().email({ message: 'Correo inválido' }),
  ruc: zod.string().min(1, { message: 'Documento es requerido' }),
  code: zod.string().optional(),
  newPassword: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

export function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const [isCodeSent, setIsCodeSent] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsPending(true);

    if (!isCodeSent) {
      try {
        const { data } = await axiosClient.post('/api/validacion/validarMail', {
          correo: values.email,
          ruc: values.ruc,
        });

        setSnackbar({ open: true, message: data.msg || 'Correo enviado correctamente', severity: 'success' });
        setIsCodeSent(true);
      } catch (error: any) {
        const msg = error?.response?.data?.msg || 'Error al enviar el código';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setIsPending(false);
      }
    } else {
      if (!values.code || !values.newPassword) {
        setSnackbar({
          open: true,
          message: 'Debes ingresar el código y la nueva contraseña',
          severity: 'error',
        });
        setIsPending(false);
        return;
      }

      try {
        const { data } = await axiosClient.post('/api/validacion/cambiarContrasena', {
          correo: values.email,
          ruc: values.ruc,
          codigo: values.code,
          nuevaContrasena: values.newPassword,
        });

        setSnackbar({ open: true, message: data.msg || 'Contraseña actualizada', severity: 'success' });

        setTimeout(() => {
          router.push('/auth/sign-in-client'); // <-- 🔁 Redirigir luego de éxito
        }, 2000);
      } catch (error: any) {
        const msg = error?.response?.data?.msg || 'Error al cambiar la contraseña';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Recuperar contraseña</Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={!!errors.email}>
                <InputLabel>Correo electrónico</InputLabel>
                <OutlinedInput {...field} label="Correo electrónico" />
                {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="ruc"
            render={({ field }) => (
              <FormControl error={!!errors.ruc}>
                <InputLabel>Documento de identidad</InputLabel>
                <OutlinedInput {...field} label="Documento de identidad" />
                {errors.ruc && <FormHelperText>{errors.ruc.message}</FormHelperText>}
              </FormControl>
            )}
          />

          {isCodeSent && (
            <>
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <FormControl error={!!errors.code}>
                    <InputLabel>Código</InputLabel>
                    <OutlinedInput {...field} label="Código" />
                    {errors.code && <FormHelperText>{errors.code.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <FormControl error={!!errors.newPassword}>
                    <InputLabel>Nueva contraseña</InputLabel>
                    <OutlinedInput {...field} type="password" label="Nueva contraseña" />
                    {errors.newPassword && <FormHelperText>{errors.newPassword.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </>
          )}

          <Button disabled={isPending} type="submit" variant="contained">
            {isCodeSent ? 'Cambiar contraseña' : 'Enviar código'}
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
