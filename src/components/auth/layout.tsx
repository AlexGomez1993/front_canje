import * as React from 'react';
import Box from '@mui/material/Box';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
      }}
    >
      {/* Contenido principal */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
          zIndex: 1, // Asegura que esté por encima del fondo
          width: '100%',
          maxWidth: '450px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
