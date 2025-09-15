const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const db = new PrismaClient();

async function main() {
  const orgName = process.env.ORGANIZATION_NAME || 'Jarvis HomeTech';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jarvishome.ge';
  const adminPass = process.env.ADMIN_PASS || 'admin123';


  let org = await db.organization.findFirst({ where: { name: orgName } });
  if (!org) {
    org = await db.organization.create({ data: { name: orgName } });
  }

  const hash = await bcrypt.hash(adminPass, 10);


  await db.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hash,
      name: 'Admin',
      role: 'OWNER',
      organizationId: org.id,
    },
    create: {
      email: adminEmail,
      password: hash,
      name: 'Admin',
      role: 'OWNER',
      organizationId: org.id,
    },
  });

  console.log(`✅ Seed complete: org='${orgName}', admin='${adminEmail}'`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error('Seed error:', e);
    await db.$disconnect();
    process.exit(1);
  });
