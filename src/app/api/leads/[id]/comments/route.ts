
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const Body = z.object({ content: z.string().min(1) });

export async function POST(req: Request, { params }: { params: { id: string }}){
  const session = await getServerSession(authOptions);
  const orgId = (session as any)?.organizationId;
  const userId = (session as any)?.userId;
  if (!orgId) return new Response('Unauthorized', { status: 401 });

  const { content } = Body.parse(await req.json());
  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.organizationId !== orgId) return new Response('Not found', { status: 404 });

  const row = await prisma.comment.create({ data: { leadId: params.id, content, organizationId: orgId, authorId: userId } });
  return Response.json(row, { status: 201 });
}
