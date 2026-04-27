import { Flag, Shield, Trash2, UserCircle2, FolderOpen, Link as LinkIcon, X } from 'lucide-react';
import Avatar from '../common/Avatar';

export default function ContactDetail({ contact, onOpenProfile, onBlock, onReport, onDeleteConversation, sharedFiles = [], sharedProjects = [], mobile = false, onClose }) {
  return (
    <aside style={{ background: 'var(--bg-3)', borderLeft: mobile ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
        {mobile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Détails du contact</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Fermer les détails">
              <X size={18} />
            </button>
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar src={contact?.avatar} name={contact?.name || 'Contact'} size={72} textStyle={{ fontSize: 24 }} />
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{contact?.name || 'Contact'}</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>{contact?.roleLabel || 'Compte'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          {contact?.verified && (
            <span className="badge badge-verified" style={{ width: 'fit-content' }}>
              <Shield size={11} /> Vérifié
            </span>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Score de confiance: <strong>{contact?.trustScore || 0}/100</strong>
          </div>
        </div>

        <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={onOpenProfile}>
          <UserCircle2 size={16} /> Voir le profil complet
        </button>
      </div>

      <div style={{ padding: 20, borderBottom: '1px solid var(--border)', overflowY: 'auto', flex: 1, display: 'grid', gap: 20 }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text)', fontWeight: 700 }}>
            <FolderOpen size={16} /> Fichiers partagés
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {sharedFiles.length === 0 ? (
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Aucun fichier partagé.</div>
            ) : (
              sharedFiles.slice(0, 10).map((file) => (
                <a key={file.id || file.url} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: '#fff', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <LinkIcon size={14} />
                  <span style={{ fontSize: 13 }}>{file.name || 'Fichier'}</span>
                </a>
              ))
            )}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text)', fontWeight: 700 }}>
            <FolderOpen size={16} /> Projets en commun
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {sharedProjects.length === 0 ? (
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Aucun projet en commun.</div>
            ) : (
              sharedProjects.map((project) => (
                <div key={project.id} style={{ padding: 10, background: '#fff', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{project.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{project.sector}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div style={{ padding: 16, display: 'grid', gap: 10, borderTop: '1px solid var(--border)', background: '#fff' }}>
        <button type="button" className="btn btn-danger" style={{ width: '100%' }} onClick={onDeleteConversation}>
          <Trash2 size={15} /> Supprimer la discussion
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onBlock}>Bloquer</button>
          <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={onReport}>
            <Flag size={15} /> Signaler
          </button>
        </div>
      </div>
    </aside>
  );
}
