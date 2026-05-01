import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const Login: React.FC = () => {
  return (
    <div>
      <LoginForm />
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Connexion disponible pour les comptes administrateur et utilisateurs.</p>
        <p style={{ marginTop: '0.5rem' }}>
          Nouveau ici ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
};
