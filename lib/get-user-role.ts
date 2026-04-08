import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
 
export type RoleRow = {
  RoleID?: string | number | null;
  Role?: string | null;
  Desg?: string | null;
  AssignedRole?: string | null;
  [key: string]: unknown;
};
 
export async function getUserRole(empCode: string): Promise<RoleRow | null> {
  const normalizedEmpCode = String(empCode ?? "").trim();
  if (!normalizedEmpCode) return null;
 
  const pool = await getConnection();
  if (!pool || !pool.connected) {
    throw new Error("Couldn't connect to Database");
  }
 
  const result = await pool
    .request()
    .input("FLAG", NVarChar, "GetRole")
    .input("EmpCode", NVarChar, normalizedEmpCode)
    .execute("PRO-WMS_GET");
 
  const rows = Array.isArray(result.recordset) ? result.recordset : [];
  return (rows[0] as RoleRow | undefined) ?? null;
}
 
 