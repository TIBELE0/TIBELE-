import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [school, setSchool] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [major, setMajor] = useState('');
  const [category, setCategory] = useState<'student' | 'professional' | 'other'>('student');
  const [profession, setProfession] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const schools = ['INFAS', 'UFR Sciences Medicales', 'UFR Odonto-Stomatologie', 'UFR Sciences Pharmaceutiques', 'Autre etablissement'];
  const majors = ['Medecine', 'Pharmacie', 'Soins infirmiers', 'Maieutique', 'Odontostomatologie', 'Kinesitherapie', 'Autre filiere'];
  const studyYears = ['1', '2', '3', '4', '5', '6', '7', '8+'];
  
  const professions = {
    student: ['Etudiant en Medecine', 'Etudiant en Pharmacie', 'Etudiant en Soins infirmiers', 'Etudiant en Maieutique', 'Etudiant en Odontostomatologie', 'Etudiant en Kinesitherapie', 'Autre etudiant'],
    professional: ['Medecin generaliste', 'Medecin specialiste', 'Infirmier', 'Infirmiere', 'Sage-femme', 'Pharmacien', 'Pharmacienne', 'Gynécologue', 'Pediatre', 'Cardiologue', 'Dermatologue', 'Autre professionnel'],
    other: ['Autre']
  };

  const getProfessions = (cat: typeof category) => professions[cat] || professions.other;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        email,
        password,
        fullName: fullName.trim(),
        matricule,
        school,
        studyYear: studyYear || undefined,
        major,
        category,
        profession: profession.trim(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Echec de l\'inscription');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '460px', margin: '2rem auto', background: '#fff', padding: '1.1rem', borderRadius: 10, boxShadow: '0 10px 24px rgba(11,59,90,0.08)' }}>
      <h2>Inscription</h2>
      <p style={{ color: '#475569', marginTop: '0.3rem', marginBottom: '0.9rem' }}>
        Creez votre compte avec toutes les informations academiques requises.
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Nom complet:</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Matricule étudiant santé:</label>
        <input
          type="text"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value.toUpperCase())}
          required
          placeholder="MED123456"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Ecole / Universite:</label>
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">Selectionnez votre etablissement</option>
          {schools.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Annee d'etude:</label>
        <select
          value={studyYear}
          onChange={(e) => setStudyYear(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">Selectionnez votre annee</option>
          {studyYears.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Type de compte:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as 'student' | 'professional' | 'other')}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="student">Etudiant</option>
          <option value="professional">Travailleur de sante</option>
          <option value="other">Autre</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Profession / Specialite:</label>
        <select
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">Selectionnez votre profession</option>
          {getProfessions(category).map((prof) => (
            <option key={prof} value={prof}>{prof}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filiere:</label>
        <select
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">Selectionnez votre filiere</option>
          {majors.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Mot de passe:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
          Minimum 8 caractères avec 1 majuscule, 1 minuscule et 1 chiffre.
        </p>
      </div>

      <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {isLoading ? 'Création...' : "S'inscrire"}
      </button>

      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.8rem' }}>
        Le compte est cree en attente de validation du matricule par l'administration.
      </p>
    </form>
  );
};
