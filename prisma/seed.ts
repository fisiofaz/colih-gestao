import { PrismaClient, DoctorType } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1. Criar (ou buscar se já existir) o Usuário ADMIN
  // Isso é essencial para preencher o campo 'createdById' dos médicos
  const admin = await prisma.user.upsert({
    where: { email: "admin@colih.org.br" },
    update: {},
    create: {
      email: "admin@colih.org.br",
      name: "Admin Sistema",
      role: "ADMIN",
    },
  });

  console.log(`👤 Usuário Admin garantido: ${admin.name} (ID: ${admin.id})`);

  // 2. Ler o arquivo JSON com os médicos
  const filePath = path.join(__dirname, "doctors.json");

  // Verificação de segurança caso o arquivo não exista
  if (!fs.existsSync(filePath)) {
    console.error("❌ Arquivo 'doctors.json' não encontrado na pasta prisma!");
    return;
  }

  const data = fs.readFileSync(filePath, "utf-8");
  const doctors = JSON.parse(data);

  console.log(`📄 Encontrados ${doctors.length} médicos no arquivo JSON.`);

  let count = 0;

  // 3. Inserir médicos no banco
  for (const doc of doctors) {
    // Verifica duplicidade pelo nome completo para evitar erros se rodar 2x
    const exists = await prisma.doctor.findFirst({
      where: {
        firstName: doc.firstName,
        lastName: doc.lastName,
      },
    });

    if (!exists) {
      await prisma.doctor.create({
        data: {
          firstName: doc.firstName,
          lastName: doc.lastName,
          city: doc.city,
          state: doc.state,
          phoneMobile: doc.phoneMobile,
          specialty1: doc.specialty1,
          type: doc.type as DoctorType,

          // Novos Campos vindos do PDF
          isSus: doc.isSus,
          hasHealthPlan: doc.hasHealthPlan,
          responsibleMember: doc.responsibleMember,

          // Campos padrão (obrigatórios)
          acceptsAdult: true,
          acceptsChild: false,
          acceptsNewborn: false,
          country: "Brasil",
          gender: "MALE", // Padrão, pois o PDF não especifica sexo
          address: "Endereço não informado no PDF",
          zipCode: "00000-000",

          // Vínculo com o Admin
          createdById: admin.id,
        },
      });
      count++;
    }
  }

  console.log(`✅ Seed finalizado! ${count} novos médicos inseridos.`);
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
