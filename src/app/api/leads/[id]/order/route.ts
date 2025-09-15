
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const Body = z.object({
  type: z.enum(['DELIVERY', 'INSTALLATION']),
  products: z.any().optional(),
  appointment: z.string().datetime().optional(),
  technician: z.string().optional(),
  address: z.string().optional(),
  amount: z.number().optional(),
  currency: z.enum(['GEL', 'USD', 'EUR']).default('GEL'),
  status: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const orgId = (session as any)?.organizationId;
  if (!orgId) return new Response('Unauthorized', { status: 401 });

  const input = Body.parse(await req.json());
  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.organizationId !== orgId) return new Response('Not found', { status: 404 });

  const data: any = {
    organizationId: orgId,
    type: input.type,
    products: input.products,
    appointment: input.appointment ? new Date(input.appointment) : null,
    technician: input.technician,
    address: input.address,
    amount: input.amount as any,
    currency: input.currency,
    status: input.status || (input.type === 'DELIVERY' ? 'Pending' : 'Scheduled'),
  };

  const exists = await prisma.order.findUnique({ where: { leadId: params.id } });
  const row = exists
    ? await prisma.order.update({ where: { leadId: params.id }, data })
    : await prisma.order.create({ data: { ...data, leadId: params.id } });
  return Response.json(row);
}
