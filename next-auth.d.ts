import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

// Estamos dizendo ao TS: "Ei, a sessão do NextAuth agora tem esses campos extras!"
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }

  // Se precisar usar o objeto User diretamente
  interface User {
    role: UserRole;
    mustChangePassword: boolean;
  }
}

// Também ensinamos o Token JWT a aceitar esses campos
declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    mustChangePassword: boolean;
  }
}
