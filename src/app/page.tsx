
'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage(){
  const [email, setEmail] = useState('admin@jarvishome.ge');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/leads' });
    setLoading(false);
  }

  return (
    <div style={{ display:'grid', placeItems:'center', minHeight:'100vh' }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 24, border:'1px solid #ddd', borderRadius: 12 }}>
        <h1 style={{ marginBottom: 16 }}>Jarvis CRM — Sign in</h1>
        <div style={{ display:'grid', gap: 12 }}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ padding: 10, border:'1px solid #ccc', borderRadius: 8 }}/>
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding: 10, border:'1px solid #ccc', borderRadius: 8 }}/>
          <button disabled={loading} type="submit" style={{ padding: 10, borderRadius: 8, background:'#111', color:'#fff' }}>{loading ? '...' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
