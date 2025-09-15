
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const Body = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'MANAGER', 'SALES', 'TECHNICIAN', 'ACCOUNTANT']).default('SALES'),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const role = (session as any).role as string;
  const orgId = (session as any).organizationId as string;
  if (!orgId) return new Response('Unauthorized', { status: 401 });
  // only OWNER or MANAGER can create users
  if (!(role === 'OWNER' || role === 'MANAGER')) return new Response('Forbidden', { status: 403 });

  const body = Body.parse(await req.json());
  const hash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: hash,
      role: body.role,
      organizationId: orgId,
    }
  });
  return Response.json({ id: user.id, email: user.email, role: user.role });
}
