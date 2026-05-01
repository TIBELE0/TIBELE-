import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export const Register: React.FC = () => {
  return (
    <div>
      <RegisterForm />
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Vous avez déjà un compte? <a href="/login">Se connecter</a></p>
      </div>
    </div>
  );
};
