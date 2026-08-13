import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";

export async function GET(req: Request) {

  const session = await getServerSession(authOptions);

  if (!session) {
    await signOut({ callbackUrl: '/sign-in', redirect: true })
    return NextResponse.json("Invalid Request")
  }

  var EmpCode = "", EmpName = ""
  if (session) {
    EmpCode = session?.user?.id || "";
    EmpName = session?.user?.username || "";
  }

  try {
    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("DB Not Connected");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "DROP-PHSTATE")
      .execute("PRO-WMS_GET");
    // console.log(result)
    return NextResponse.json({ success: true, data: result.recordset ?? [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 },
    );
  }

}