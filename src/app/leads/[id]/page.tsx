
'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';

export default function LeadDetail({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('NEW');
  const [orderType, setOrderType] = useState<'DELIVERY' | 'INSTALLATION'>('DELIVERY');
  const [amount, setAmount] = useState('');
  const [appointment, setAppointment] = useState('');
  const [address, setAddress] = useState('');
  const [technician, setTechnician] = useState('');

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then((rows) => {
      const row = rows.find((x: any) => x.id === params.id);
      if (row) {
        setLead(row);
        setStatus(row.status);
        setOrderType(row.order?.type || 'DELIVERY');
        setAmount(row.order?.amount || '');
        setAddress(row.order?.address || row.contact?.address || '');
        if (row.order?.appointment) setAppointment(new Date(row.order.appointment).toISOString().slice(0, 16));
        setTechnician(row.order?.technician || '');
      }
    });
  }, [params.id]);

  async function addComment() {
    if (!comment.trim()) return;
    await fetch(`/api/leads/${params.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: comment }) });
    location.reload();
  }
  async function updateStatus() {
    await fetch(`/api/leads/${params.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    location.reload();
  }
  async function saveOrder() {
    await fetch(`/api/leads/${params.id}/order`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        type: orderType,
        amount: amount ? Number(amount) : undefined,
        address: address || undefined,
        appointment: appointment ? new Date(appointment).toISOString() : undefined,
        technician: technician || undefined,
        currency: 'GEL'
      })
    });
    location.reload();
  }

  if (!lead) return (<div><Nav /><div style={{ padding: 16 }}>Loading…</div></div>);
  return (
    <div>
      <Nav />
      <div style={{ padding: 16, display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Lead • {lead.contact?.fullName || lead.title}</h1>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {['NEW', 'QUALIFIED', 'QUOTE_SENT', 'SCHEDULED', 'DELIVERED', 'INSTALLED', 'PAID', 'SUPPORT', 'LOST'].map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button onClick={updateStatus}>Save Status</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <h3>Comments</h3>
            <div style={{ maxHeight: 260, overflow: 'auto', display: 'grid', gap: 8 }}>
              {lead.comments?.map((c: any) => (
                <div key={c.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>{new Date(c.createdAt).toLocaleString()}</div>
                  <div>{c.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add comment…" style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 8 }} />
              <button onClick={addComment}>Add</button>
            </div>
          </div>

          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <h3>Order</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <div>
                <label><input type="radio" checked={orderType === 'DELIVERY'} onChange={() => setOrderType('DELIVERY')} /> Delivery</label>{' '}
                <label style={{ marginLeft: 12 }}><input type="radio" checked={orderType === 'INSTALLATION'} onChange={() => setOrderType('INSTALLATION')} /> Installation</label>
              </div>
              <div>
                <div>Amount (GEL)</div>
                <input value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 8 }} />
              </div>
              <div>
                <div>Address</div>
                <input value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 8 }} />
              </div>
              {orderType === 'INSTALLATION' && (
                <>
                  <div>
                    <div>Appointment (datetime)</div>
                    <input type="datetime-local" value={appointment} onChange={e => setAppointment(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 8 }} />
                  </div>
                  <div>
                    <div>Technician</div>
                    <input value={technician} onChange={e => setTechnician(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 8 }} />
                  </div>
                </>
              )}
              <button onClick={saveOrder}>Save Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
