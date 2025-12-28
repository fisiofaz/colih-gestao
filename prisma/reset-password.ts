import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@colih.org.br";
  const newPassword = "123456"; // <--- SUA NOVA SENHA AQUI

  console.log(`🔄 Resetando senha para: ${email}...`);

  // 1. Gera o hash seguro da senha
  const passwordHash = await hash(newPassword, 12);

  // 2. Atualiza no banco
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: passwordHash },
    });
    console.log(`✅ Sucesso! A senha do admin agora é: ${newPassword}`);
  } catch (error) {
    console.error("❌ Erro ao atualizar. Verifique se o usuário admin existe.");
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