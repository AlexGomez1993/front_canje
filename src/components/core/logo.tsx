'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { NoSsr } from '@/components/core/no-ssr';
import type { SxProps } from '@mui/material/styles';

const HEIGHT = 140;
const WIDTH = 150;

type Color = 'dark' | 'light';
type ResponsiveSize = number | { xs?: number; sm?: number; md?: number; lg?: number };

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: ResponsiveSize;
  width?: ResponsiveSize;
  sx?: SxProps;
}
export function Logo({ 
  color = 'dark', 
  emblem, 
  height = HEIGHT, 
  width = WIDTH,
  sx 
}: LogoProps): React.JSX.Element {
  const theme = useTheme();
  
  // Rutas diferentes para cada tema
  const logoUrl = color === 'light' 
    ? '/assets/logoscala.png' 
    : '/assets/logoscala.png';

  return (
    <Box
      component="img"
      alt="Logo Scala"
      src={logoUrl}
      sx={{
        height: responsiveSize(height),
        width: responsiveSize(width),
        maxWidth: '100%',
        maxHeight: '190%',
        objectFit: 'contain',
        transition: 'all 0.3s ease',
        display: 'block',
        [theme.breakpoints.down('md')]: {
          height: responsiveSize(height, 0.8),
          width: responsiveSize(width, 0.8)
        },
        [theme.breakpoints.down('sm')]: {
          height: responsiveSize(height, 0.6),
          width: responsiveSize(width, 0.6)
        },
        ...sx
      }}
      onError={(e) => {
        // Fallback para errores de carga
        (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
      }}
    />
  );
}


// Función helper para manejar tamaños responsive
function responsiveSize(size: ResponsiveSize, scale: number = 1): any {
  if (typeof size === 'number') return `${size * scale}px`;
  return Object.fromEntries(
    Object.entries(size).map(([breakpoint, value]) => [
      breakpoint,
      `${(value || 0) * scale}px`
    ])
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: ResponsiveSize;
  width?: ResponsiveSize;
  sx?: SxProps;
}

export function DynamicLogo({
  colorDark = 'dark',
  colorLight = 'light',
  height = HEIGHT,
  width = WIDTH,
  sx,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? colorDark : colorLight;

  return (
    <NoSsr 
      fallback={
        <Box 
          sx={{ 
            width: responsiveSize(width),
            height: responsiveSize(height),
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
            ...sx 
          }} 
        />
      }>
      <Logo 
        color={color} 
        height={height}
        width={width}
        sx={sx} 
        {...props} 
      />
    </NoSsr>
  );
}
