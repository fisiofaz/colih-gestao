// criar-admin.ts
import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs"; // O asterisco corrige problemas de importação

const prisma = new PrismaClient();

async function main() {
  const senhaSecreta = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@colih.com" },
    update: { 
      password: senhaSecreta, 
      role: UserRole.COLIH 
    },
    create: {
      email: "admin@colih.com",
      name: "Admin Master",
      password: senhaSecreta,
      role: UserRole.ADMIN,
    },
  });

  console.log("✅ Usuario Admin criado com sucesso!");
  console.log("📧 Email: admin@colih.com");
  console.log("🔑 Senha: 123456");
  console.log(`🛡️ Cargo: ${user.role}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
