import React, { useEffect, useState } from 'react';
import { adminService } from '../services/pathologyService';

interface GroupItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export const AdminGroupes: React.FC = () => {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [newGroup, setNewGroup] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const ok = (text: string) => { setErr(null); setMsg(text); };
  const ko = (text: string) => { setMsg(null); setErr(text); };

  const loadGroups = async () => {
    try {
      const res = await adminService.getGroups();
      setGroups(res.data?.groups ?? []);
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Erreur de chargement des groupes.');
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const createOrUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroupId) {
        await adminService.updateGroup(editingGroupId, { name: editingGroupName });
        ok('Groupe mis à jour.');
      } else {
        await adminService.createGroup({ name: newGroup });
        ok('Groupe créé.');
      }
      setNewGroup('');
      setEditingGroupId(null);
      setEditingGroupName('');
      await loadGroups();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action groupe impossible.');
    }
  };

  const deleteGroup = async (id: string) => {
    if (!window.confirm('Supprimer ce groupe ?')) return;
    try {
      await adminService.deleteGroup(id);
      ok('Groupe supprimé.');
      await loadGroups();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression groupe impossible.');
    }
  };

  const groupsSorted = groups.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="adm-shell">
      <div className="adm-content">
        <header className="adm-topbar">
          <div>
            <h1 className="adm-topbar__title">Gestion des Groupes</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#475569', fontWeight: 600 }}>Administration des groupes de pathologies</p>
          </div>
        </header>

        {msg && <div className="adm-alert adm-alert--success">{msg}</div>}
        {err && <div className="adm-alert adm-alert--error">{err}</div>}

        <section className="adm-panel">
          <div className="adm-section-toolbar">
            <h3 className="adm-section-title">Groupes ({groupsSorted.length})</h3>
          </div>

          <form onSubmit={createOrUpdateGroup} className="adm-form-row">
            <label>
              Nom du groupe
              <input
                value={editingGroupId ? editingGroupName : newGroup}
                onChange={(e) => editingGroupId ? setEditingGroupName(e.target.value) : setNewGroup(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="adm-btn adm-btn--ok">
              {editingGroupId ? 'Mettre à jour' : 'Ajouter'}
            </button>
            {editingGroupId && (
              <button
                type="button"
                className="adm-btn"
                onClick={() => {
                  setEditingGroupId(null);
                  setEditingGroupName('');
                  setNewGroup('');
                }}
              >
                Annuler
              </button>
            )}
          </form>

          <div className="adm-table-wrap" style={{ marginTop: '1rem' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Slug</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupsSorted.map((g) => (
                  <tr key={g._id}>
                    <td>{g.name}</td>
                    <td>{g.slug}</td>
                    <td>
                      <button
                        type="button"
                        className="adm-btn"
                        onClick={() => {
                          setEditingGroupId(g._id);
                          setEditingGroupName(g.name);
                        }}
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--danger"
                        style={{ marginLeft: '0.5rem' }}
                        onClick={() => deleteGroup(g._id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};