
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const Body = z.object({ status: z.enum(['NEW','QUALIFIED','QUOTE_SENT','SCHEDULED','DELIVERED','INSTALLED','PAID','SUPPORT','LOST']) });

export async function PATCH(req: Request, { params }: { params: { id: string }}){
  const session = await getServerSession(authOptions);
  const orgId = (session as any)?.organizationId;
  if (!orgId) return new Response('Unauthorized', { status: 401 });

  const { status } = Body.parse(await req.json());
  const row = await prisma.lead.update({ where: { id: params.id }, data: { status } });
  if (row.organizationId !== orgId) return new Response('Forbidden', { status: 403 });
  return Response.json(row);
}
