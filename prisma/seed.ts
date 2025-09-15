
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function main(){
  const orgName = process.env.ORGANIZATION_NAME || 'Jarvis HomeTech';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jarvishome.ge';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  const org = await db.organization.upsert({
    where: { name: orgName },
    update: {},
    create: { name: orgName },
  });

  const hash = await bcrypt.hash(adminPass, 10);

  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hash,
      name: 'Admin',
      role: 'OWNER',
      organizationId: org.id,
    }
  });

  console.log(`Seeded org=${org.name}, admin=${adminEmail}`);
}

main().finally(()=>db.$disconnect());
