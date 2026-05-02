import React, { useEffect, useState, useMemo } from 'react';
import { pathologyService } from '../services/pathologyService';

interface PathologyItem {
  _id: string;
  title: string;
  shortDescription: string;
  groupe: string;
  definition: string;
  examinations: string;
  referentialDiagnosis: string;
  onSiteTreatment: string;
  dischargeOrder: string;
  prevention: string;
  isFree: boolean;
  isHidden?: boolean;
}

export const AdminPathologiesList: React.FC = () => {
  const [pathologies, setPathologies] = useState<PathologyItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPathologyId, setEditingPathologyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [pathologyForm, setPathologyForm] = useState({
    title: '',
    shortDescription: '',
    groupe: 'Autres',
    definition: '',
    examinations: '',
    referentialDiagnosis: '',
    onSiteTreatment: '',
    dischargeOrder: '',
    prevention: '',
    isFree: true,
    isHidden: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  const ok = (text: string) => { setErr(null); setMsg(text); };
  const ko = (text: string) => { setMsg(null); setErr(text); };

  const loadPathologies = async () => {
    try {
      const res = await pathologyService.getAllPathologies(1, 500, true);
      setPathologies(res.data?.pathologies ?? []);
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Erreur de chargement des pathologies.');
    }
  };

  useEffect(() => {
    void loadPathologies();
  }, []);

  const availableGroups = useMemo(
    () => Array.from(new Set(pathologies.map((p) => p.groupe || 'Autres'))).sort(),
    [pathologies],
  );

  const filteredPathologies = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return pathologies.filter((pathology) => {
      const matchesSearch = !search || [
        pathology.title,
        pathology.shortDescription,
        pathology.definition,
        pathology.examinations,
        pathology.referentialDiagnosis,
        pathology.onSiteTreatment,
        pathology.dischargeOrder,
        pathology.prevention,
        pathology.groupe,
      ].some((field) => field.toLowerCase().includes(search));

      const matchesGroup = !groupFilter || (pathology.groupe || 'Autres') === groupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [pathologies, searchTerm, groupFilter]);

  const pathologiesByGroupe = useMemo(() => {
    return filteredPathologies.reduce<Record<string, PathologyItem[]>>((acc, pathology) => {
      const groupName = pathology.groupe || 'Autres';
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(pathology);
      return acc;
    }, {});
  }, [filteredPathologies]);

  const createOrUpdatePathology = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPathologyId) {
        await pathologyService.updatePathology(editingPathologyId, pathologyForm);
        ok('Pathologie mise à jour.');
      } else {
        await pathologyService.createPathology(pathologyForm);
        ok('Pathologie créée.');
      }
      setEditingPathologyId(null);
      setShowModal(false);
      setPathologyForm({
        title: '', shortDescription: '', groupe: 'Autres', definition: '', examinations: '',
        referentialDiagnosis: '', onSiteTreatment: '', dischargeOrder: '', prevention: '', isFree: true,
        isHidden: true,
      });
      await loadPathologies();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action pathologie impossible.');
    }
  };

  const deletePathology = async (id: string) => {
    if (!window.confirm('Supprimer cette pathologie ?')) return;
    try {
      await pathologyService.deletePathology(id);
      ok('Pathologie supprimée.');
      await loadPathologies();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression pathologie impossible.');
    }
  };

  const openEditModal = (pathology: PathologyItem) => {
    setEditingPathologyId(pathology._id);
    setPathologyForm({
      title: pathology.title,
      shortDescription: pathology.shortDescription,
      groupe: pathology.groupe,
      definition: pathology.definition || '',
      examinations: pathology.examinations || '',
      referentialDiagnosis: pathology.referentialDiagnosis || '',
      onSiteTreatment: pathology.onSiteTreatment || '',
      dischargeOrder: pathology.dischargeOrder || '',
      prevention: pathology.prevention || '',
      isFree: pathology.isFree,
      isHidden: pathology.isHidden || false,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingPathologyId(null);
    setPathologyForm({
      title: '', shortDescription: '', groupe: 'Autres', definition: '', examinations: '',
      referentialDiagnosis: '', onSiteTreatment: '', dischargeOrder: '', prevention: '', isFree: true,
      isHidden: true,
    });
    setShowModal(true);
  };

  return (
    <main className="adm-shell">
      <div className="adm-content">
        <header className="adm-topbar">
          <div>
            <h1 className="adm-topbar__title">Gestion des Pathologies</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#475569', fontWeight: 600 }}>Administration des pathologies médicales</p>
          </div>
        </header>

        {msg && <div className="adm-alert adm-alert--success">{msg}</div>}
        {err && <div className="adm-alert adm-alert--error">{err}</div>}

        <section className="adm-panel">
          <div className="adm-section-toolbar">
            <h3 className="adm-section-title">Pathologies ({filteredPathologies.length})</h3>
            <button type="button" className="adm-btn adm-btn--ok" onClick={openCreateModal}>
              Ajouter une pathologie
            </button>
          </div>

          <div className="adm-global-filters">
            <label className="adm-global-filters__label">
              Rechercher
              <input
                type="search"
                className="adm-search"
                placeholder="Titre, groupe, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <label className="adm-global-filters__label">
              Groupe
              <select
                className="adm-select"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="">Tous</option>
                {availableGroups.map((groupName) => (
                  <option key={groupName} value={groupName}>{groupName}</option>
                ))}
              </select>
            </label>
          </div>

          {Object.entries(pathologiesByGroupe).length === 0 ? (
            <div className="adm-alert adm-alert--warn">Aucune pathologie ne correspond aux filtres.</div>
          ) : (
            Object.entries(pathologiesByGroupe).map(([groupName, groupPathologies]) => (
              <details key={groupName} className="adm-accordion" open style={{ marginBottom: '1rem' }}>
                <summary className="adm-accordion__summary">
                  {groupName} ({groupPathologies.length})
                </summary>
                <div className="adm-accordion__panel">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Masquée</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupPathologies.map((p) => (
                        <tr key={p._id}>
                          <td>{p.title}</td>
                          <td>{p.shortDescription}</td>
                          <td>
                            <span className={`adm-badge ${p.isFree ? 'adm-badge--green' : 'adm-badge--yellow'}`}>
                              {p.isFree ? 'Libre' : 'Premium'}
                            </span>
                          </td>
                          <td>{p.isHidden ? 'Oui' : 'Non'}</td>
                          <td>
                            <button
                              type="button"
                              className="adm-btn"
                              onClick={() => openEditModal(p)}
                            >
                              Éditer
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn--danger"
                              style={{ marginLeft: '0.5rem' }}
                              onClick={() => deletePathology(p._id)}
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))
          )}
        </section>
      </div>

      {showModal && (
        <div className="adm-modal">
          <div className="adm-modal__content">
            <div className="adm-modal__header">
              <h3>{editingPathologyId ? 'Modifier la Pathologie' : 'Nouvelle Pathologie'}</h3>
              <button
                type="button"
                className="adm-modal__close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createOrUpdatePathology} className="adm-modal__body">
              <div className="adm-form-grid adm-form-grid--cols2">
                <label>
                  Titre
                  <input
                    value={pathologyForm.title}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Résumé
                  <input
                    value={pathologyForm.shortDescription}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, shortDescription: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Groupe
                  <select
                    value={pathologyForm.groupe}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, groupe: e.target.value }))}
                  >
                    {Object.keys(pathologiesByGroupe).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="Autres">Autres</option>
                  </select>
                </label>
                <div></div>
                <label className="adm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={pathologyForm.isFree}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, isFree: e.target.checked }))}
                  />
                  Gratuit
                </label>
                <label className="adm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={pathologyForm.isHidden}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, isHidden: e.target.checked }))}
                  />
                  Masquée
                </label>
                <label>
                  Définition
                  <textarea
                    value={pathologyForm.definition}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, definition: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Examens
                  <textarea
                    value={pathologyForm.examinations}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, examinations: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Diagnostic
                  <textarea
                    value={pathologyForm.referentialDiagnosis}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, referentialDiagnosis: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Traitement
                  <textarea
                    value={pathologyForm.onSiteTreatment}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, onSiteTreatment: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Ordonnance
                  <textarea
                    value={pathologyForm.dischargeOrder}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, dischargeOrder: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Prévention
                  <textarea
                    value={pathologyForm.prevention}
                    onChange={(e) => setPathologyForm((p) => ({ ...p, prevention: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="adm-modal__footer">
                <button type="submit" className="adm-btn adm-btn--ok">
                  {editingPathologyId ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  className="adm-btn"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
