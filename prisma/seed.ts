import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Criar (ou buscar se já existir) um Usuário ADMIN
  // Usamos 'upsert' (Update ou Insert): Se existe, não faz nada. Se não, cria.
  const admin = await prisma.user.upsert({
    where: { email: "admin@colih.org.br" },
    update: {},
    create: {
      email: "admin@colih.org.br",
      name: "Admin Sistema",
      role: "ADMIN",
    },
  });

  console.log(`👤 Usuário Admin criado: ${admin.name}`);

  // 2. Criar um Médico de Teste (Vinculado ao Admin)
  const doctor1 = await prisma.doctor.create({
    data: {
      firstName: "Lucas",
      lastName: "Silva",
      type: "COOPERATING", // Médico Cooperador
      gender: "MALE",

      // Contato
      email: "dr.lucas@exemplo.com",
      phoneMobile: "55999998888",

      // Endereço (Simulando Santa Maria - RS)
      address: "Av. Nossa Senhora Medianeira, 100",
      city: "Santa Maria",
      state: "RS",
      zipCode: "97060-000",
      country: "Brasil",

      // Especialidades
      specialty1: "Cardiologia",
      specialty2: "Clínica Médica",

      // Aceita quais pacientes?
      acceptsAdult: true,
      acceptsChild: false,
      acceptsNewborn: false,

      // Quem cadastrou? O Admin que criamos acima
      createdById: admin.id,
    },
  });

  console.log(`👨‍⚕️ Médico criado: Dr. ${doctor1.firstName}`);

  // 3. Criar uma Médica de Teste
  const doctor2 = await prisma.doctor.create({
    data: {
      firstName: "Mariana",
      lastName: "Costa",
      type: "CONSULTANT", // Médica Consultora
      gender: "FEMALE",

      phoneMobile: "55988887777",

      address: "Rua do Acampamento, 50",
      city: "Santa Maria",
      state: "RS",
      zipCode: "97050-000",
      country: "Brasil",

      specialty1: "Pediatria",

      acceptsAdult: false,
      acceptsChild: true,
      acceptsNewborn: true,

      createdById: admin.id,
    },
  });

  console.log(`👩‍⚕️ Médica criada: Dra. ${doctor2.firstName}`);
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
