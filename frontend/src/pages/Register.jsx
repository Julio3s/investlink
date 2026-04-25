import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, Briefcase, TrendingUp } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'', confirm:'', role:'', first_name:'', last_name:'', phone:'', country:'' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Les mots de passe ne correspondent pas');
    if (!form.role) return toast.error('Choisissez votre rôle');
    setLoading(true);
    try {
      await register(form);
      toast.success('Compte créé avec succès !');
      navigate('/projects');
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 0'}}>
      <div className="animate-in" style={{width:'100%',maxWidth:520,padding:'0 24px'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <h1 className="section-title">Créer un compte</h1>
          <p style={{color:'var(--text-2)',marginTop:8}}>Rejoignez la communauté InvestLink</p>
        </div>
        <div className="card glow-card">
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:20}}>
            <div className="form-group">
              <label>Je suis</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{value:'porteur',label:'Porteur de projet',icon:Briefcase,desc:"J'ai un projet à financer"},
                  {value:'investisseur',label:'Investisseur',icon:TrendingUp,desc:"Je cherche à investir"}].map(({value,label,icon:Icon,desc})=>(
                  <button key={value} type="button" onClick={()=>set('role',value)}
                    style={{padding:16,borderRadius:'var(--radius)',border:`2px solid ${form.role===value?'var(--primary)':'var(--border)'}`,background:form.role===value?'var(--primary-glow)':'var(--bg-3)',color:form.role===value?'var(--primary)':'var(--text-2)',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}>
                    <Icon size={20} style={{marginBottom:8}}/>
                    <div style={{fontWeight:700,fontSize:14}}>{label}</div>
                    <div style={{fontSize:12,opacity:0.7,marginTop:2}}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="form-group"><label>Prénom</label><input className="input" placeholder="Jean" value={form.first_name} onChange={e=>set('first_name',e.target.value)} required/></div>
              <div className="form-group"><label>Nom</label><input className="input" placeholder="Dupont" value={form.last_name} onChange={e=>set('last_name',e.target.value)} required/></div>
            </div>
            <div className="form-group"><label>Email</label><input className="input" type="email" placeholder="votre@email.com" value={form.email} onChange={e=>set('email',e.target.value)} required/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="form-group"><label>Téléphone</label><input className="input" placeholder="+33 6 00 00 00" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
              <div className="form-group"><label>Pays</label>
                <select className="input" value={form.country} onChange={e=>set('country',e.target.value)}>
                  <option value="">Sélectionner</option>
                  {['France','Maroc','Sénégal','Côte d\'Ivoire','Tunisie','Algérie','Bénin','Cameroun','Canada','Belgique','Suisse','Autre'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Mot de passe</label>
              <div style={{position:'relative'}}>
                <input className="input" type={showPw?'text':'password'} placeholder="Minimum 8 caractères" value={form.password} onChange={e=>set('password',e.target.value)} minLength={8} required style={{paddingRight:44}}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-3)',cursor:'pointer'}}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div>
            </div>
            <div className="form-group"><label>Confirmer</label><input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={e=>set('confirm',e.target.value)} required/></div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:4}}>
              {loading?<span className="spinner"/>:<><UserPlus size={16}/>Créer mon compte</>}
            </button>
          </form>
          <div className="divider"/>
          <p style={{textAlign:'center',color:'var(--text-2)',fontSize:14}}>Déjà inscrit ? <Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}
