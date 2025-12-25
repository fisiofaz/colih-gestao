import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type LogAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
type LogResource = "DOCTOR" | "USER" | "SESSION";

export async function logAudit(
  action: LogAction,
  resource: LogResource,
  details: string
) {
  try {
    const session = await auth();

    // Se não tiver usuário logado (ex: sistema), não loga ou loga como 'Sistema'
    // Mas no nosso caso, todas as actions exigem login.
    if (!session?.user?.id) return;

    await prisma.auditLog.create({
      data: {
        action,
        resource,
        details,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Falha ao criar log de auditoria:", error);
    // Não damos throw no erro para não travar a ação principal se o log falhar
  }
}
