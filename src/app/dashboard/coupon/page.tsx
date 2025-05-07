
import React, { ChangeEvent, useEffect, useState } from 'react';

export interface PageProps {
  params?: any;
  searchParams?: any;
  [key: string]: any;  // Acepta cualquier propiedad adicional como 'logo'
}
interface CouponProps extends PageProps {
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
  cupones: number; // Número de cupones para esta campaña
}



const Coupon: React.FC<CouponProps> = ({ logo, numCupon, hoy, cliente, campania, cupones }) => {
  return (
    <div style={{ border: '2px dashed #000', padding: '20px', margin: '10px', maxWidth: '400px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={logo} alt="Scala Logo" style={{ width: '50px' }} />
      </div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>SCALA SHOPPING</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>NÚMERO DE CUPÓN:</strong> <span id="numerocupon">{numCupon}</span>
        </p>
        <p>
          <strong>FECHA:</strong> {hoy}
        </p>
        <p>
          <strong>CLIENTE:</strong> {cliente.nombre} {cliente.apellidos}
        </p>
        <p>
          <strong>CI/RUC:</strong> {cliente.ruc}
        </p>
        <p>
          <strong>TELÉFONO:</strong> {cliente.telefono}
        </p>
        <p>
          <strong>CELULAR:</strong> {cliente.celular}
        </p>
        <p>
          <strong>DIRECCIÓN:</strong> {cliente.direccion}
        </p>
        <p>
          <strong>CAMPAÑA:</strong> {campania}
        </p>
        <p>
          <strong>CUPONES:</strong> {cupones}
        </p>
      </div>
      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px' }}>
        <strong>Nota: Favor conservar sus facturas.</strong>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          “El cliente para participar en la promoción confiere voluntariamente sus datos personales, y autoriza a que
          los mismos sean recopilados y utilizados para las campañas del Centro Comercial, tratados de conformidad con
          la Ley Orgánica de Protección de Datos Personales. Estos no serán transferidos a terceros. Si el cliente no
          desea constar en la base de datos del centro comercial, puede solicitar su eliminación al correo
          info-scala@smo.ec.”
        </p>
      </div>
    </div>
  );
};

export default Coupon;
