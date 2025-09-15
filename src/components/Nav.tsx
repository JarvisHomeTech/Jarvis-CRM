
'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Nav(){
  return (
    <div style={{ display:'flex', gap:12, padding:12, borderBottom:'1px solid #eee' }}>
      <Link href="/leads">Leads</Link>
      <button onClick={()=>signOut({ callbackUrl: '/' })} style={{ marginLeft:'auto' }}>Sign out</button>
    </div>
  );
}
