import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@colih.org.br";
  const newPassword = "123456"; 

  console.log(`🔄 Conectando ao banco para resetar senha de: ${email}...`);

  // 1. Gera o hash seguro da senha
 const passwordHash = await hash(newPassword, 10);

  // 2. Atualiza no banco
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: passwordHash,
        mustChangePassword: false,
      },
    });
   console.log(
     `✅ Sucesso! Senha alterada para '${newPassword}' no usuário ID: ${user.id}`
   );
  } catch (error) {
    console.error("❌ Erro: Usuário não encontrado ou erro de conexão.");
    console.error(error);
  }
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