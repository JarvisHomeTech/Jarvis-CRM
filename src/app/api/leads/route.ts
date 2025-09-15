
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const LeadInput = z.object({
  title: z.string().min(2),
  source: z.enum(['FB_LEAD_ADS','WEBSITE','MANUAL','WHATSAPP','TELEGRAM','REFERRAL']).default('MANUAL'),
  contact: z.object({ fullName: z.string().optional(), phone: z.string().optional(), email: z.string().email().optional(), address: z.string().optional() }).optional(),
  notes: z.string().optional(),
  meta: z.any().optional(),
});

export async function GET(){
  const session = await getServerSession(authOptions);
  const orgId = (session as any)?.organizationId;
  if (!orgId) return new Response('Unauthorized', { status: 401 });
  const rows = await prisma.lead.findMany({
    where: { organizationId: orgId },
    include: { contact: true, comments: true, order: true },
    orderBy: { createdAt: 'desc' }
  });
  return Response.json(rows);
}

export async function POST(req: Request){
  const session = await getServerSession(authOptions);
  const orgId = (session as any)?.organizationId;
  const userId = (session as any)?.userId;
  if (!orgId) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const input = LeadInput.parse(body);

  const contact = input.contact ? await prisma.contact.create({ data: { ...input.contact, organizationId: orgId } }) : undefined;
  const lead = await prisma.lead.create({
    data: { title: input.title, source: input.source, contactId: contact?.id, meta: input.meta, organizationId: orgId, ownerId: userId }
  });
  if (body.notes) {
    await prisma.comment.create({ data: { leadId: lead.id, content: body.notes, organizationId: orgId, authorId: userId } });
  }
  const out = await prisma.lead.findUnique({ where: { id: lead.id }, include: { contact: true, comments: true } });
  return Response.json(out, { status: 201 });
}
