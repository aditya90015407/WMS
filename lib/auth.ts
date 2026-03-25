import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export type UserRole = "ADMIN" | "DEPARTMENTS";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  return {
    username: session.user.username,
    uid: session.user.uid,
    deptId: session.user.deptId,
    role: session.user.role as UserRole,
    roles: session.user.roles || [],
    WMSUnit: session.user.WMSUnit,
    WMSDept: session.user.WMSDept,
    id: session.user.id
  };
}
