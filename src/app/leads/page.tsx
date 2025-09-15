
'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';

export default function LeadsPage(){
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{ fetch('/api/leads').then(r=>r.json()).then(setRows); },[]);
  return (
    <div>
      <Nav/>
      <div style={{ padding: 16 }}>
        <h1>Leads</h1>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th align="left">Title</th><th align="left">Status</th><th align="left">Name</th><th align="left">Phone</th><th align="left">Created</th></tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} style={{ borderTop:'1px solid #eee', cursor:'pointer' }} onClick={()=>location.href=`/leads/${r.id}`}>
                <td>{r.title}</td>
                <td>{r.status}</td>
                <td>{r.contact?.fullName || '-'}</td>
                <td>{r.contact?.phone || '-'}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
