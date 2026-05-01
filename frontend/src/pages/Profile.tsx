import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [school, setSchool] = useState(user?.school || '');
  const [studyYear, setStudyYear] = useState(user?.studyYear || '');
  const [major, setMajor] = useState(user?.major || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const matriculeStatus = useMemo(() => (user?.matriculeValidated ? 'Validé' : 'En attente'), [user?.matriculeValidated]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    try {
      await authService.updateProfile({ fullName, school, studyYear, major });
      await refreshUser();
      setMsg('Profil mis à jour.');
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Mise à jour impossible.');
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMsg('Mot de passe mis à jour.');
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Changement de mot de passe impossible.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '760px', margin: '0 auto' }}>
      <h1>Mon Profil</h1>

      {msg && <p style={{ color: '#166534' }}>{msg}</p>}
      {err && <p style={{ color: '#b91c1c' }}>{err}</p>}

      <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Matricule:</strong> {user.matricule}</p>
        <p><strong>Statut matricule:</strong> {matriculeStatus}</p>
        <p><strong>Rôle:</strong> {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
      </div>

      <form onSubmit={onSaveProfile} style={{ display: 'grid', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <h2>Modifier mes informations</h2>
        <label>Nom complet
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </label>
        <label>École / Université
          <input value={school} onChange={(e) => setSchool(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </label>
        <label>Année d'étude
          <input value={studyYear} onChange={(e) => setStudyYear(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </label>
        <label>Filière
          <input value={major} onChange={(e) => setMajor(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </label>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </form>

      <form onSubmit={onChangePassword} style={{ display: 'grid', gap: '0.8rem' }}>
        <h2>Changer le mot de passe</h2>
        <label>Mot de passe actuel
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} required />
        </label>
        <label>Nouveau mot de passe
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} required />
        </label>
        <button type="submit" className="btn-secondary">Mettre à jour le mot de passe</button>
      </form>

      <button
        onClick={logout}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
};
