
import { prisma } from '@/lib/db';

export async function GET(req: Request){
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const challenge = url.searchParams.get('hub.challenge');
  const token = url.searchParams.get('hub.verify_token');
  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// NOTE: Multi-tenant mapping: For MVP we assume single organization (first one).
// In future, map page_id -> organizationId.
export async function POST(req: Request){
  const body = await req.json();
  const org = await prisma.organization.findFirst();
  if (!org) return Response.json({ ok: false, error: 'No org' }, { status: 500 });

  try {
    for (const entry of body.entry || []){
      for (const change of entry.changes || []){
        const leadgen = change.value;
        const contactData: any = { organizationId: org.id };
        if (leadgen?.field_data) {
          for (const f of leadgen.field_data){
            const name = (f.name || '').toLowerCase();
            const v = (f.values?.[0] || '').toString();
            if (name.includes('full') || name.includes('name')) contactData.fullName = v;
            if (name.includes('phone')) contactData.phone = v;
            if (name.includes('mail')) contactData.email = v;
            if (name.includes('address')) contactData.address = v;
          }
        }
        const contact = Object.keys(contactData).length > 1 ? await prisma.contact.create({ data: contactData }) : undefined;
        await prisma.lead.create({
          data: {
            organizationId: org.id,
            title: 'Facebook Inquiry',
            source: 'FB_LEAD_ADS',
            contactId: contact?.id,
            meta: leadgen,
          }
        });
      }
    }
  } catch (e){
    console.error('FB Lead webhook error', e);
  }
  return Response.json({ ok: true });
}
