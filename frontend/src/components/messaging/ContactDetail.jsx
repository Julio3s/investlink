import { Flag, Shield, UserCircle2, FolderOpen, Link as LinkIcon } from 'lucide-react';
import Avatar from '../common/Avatar';

export default function ContactDetail({ contact, onOpenProfile, onBlock, onReport, sharedFiles = [], sharedProjects = [] }) {
  return (
    <aside style={{ background: '#f8fafc', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar src={contact?.avatar} name={contact?.name || 'Contact'} size={72} textStyle={{ fontSize: 24 }} />
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#171717' }}>{contact?.name || 'Contact'}</h3>
            <p style={{ color: '#737373', fontSize: 13, marginTop: 4 }}>{contact?.roleLabel || 'Compte'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          {contact?.verified && (
            <span className="badge badge-verified" style={{ width: 'fit-content' }}>
              <Shield size={11} /> Vérifié
            </span>
          )}
          <div style={{ fontSize: 13, color: '#404040' }}>
            Score de confiance: <strong>{contact?.trustScore || 0}/100</strong>
          </div>
        </div>

        <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={onOpenProfile}>
          <UserCircle2 size={16} /> Voir le profil complet
        </button>
      </div>

      <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb', overflowY: 'auto', flex: 1, display: 'grid', gap: 20 }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#171717', fontWeight: 700 }}>
            <FolderOpen size={16} /> Fichiers partagés
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(sharedFiles || []).length === 0 ? (
              <div style={{ color: '#737373', fontSize: 13 }}>Aucun fichier partagé.</div>
            ) : (
              sharedFiles.slice(0, 10).map((file) => (
                <a key={file.id || file.url} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                  <LinkIcon size={14} />
                  <span style={{ fontSize: 13 }}>{file.name || 'Fichier'}</span>
                </a>
              ))
            )}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#171717', fontWeight: 700 }}>
            <FolderOpen size={16} /> Projets en commun
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(sharedProjects || []).length === 0 ? (
              <div style={{ color: '#737373', fontSize: 13 }}>Aucun projet en commun.</div>
            ) : (
              sharedProjects.map((project) => (
                <div key={project.id} style={{ padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{project.title}</div>
                  <div style={{ fontSize: 12, color: '#737373' }}>{project.sector}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div style={{ padding: 16, display: 'flex', gap: 10, borderTop: '1px solid #e5e7eb', background: '#fff' }}>
        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onBlock}>Bloquer</button>
        <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={onReport}>
          <Flag size={15} /> Signaler
        </button>
      </div>
    </aside>
  );
}
