import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";


export async function GET(req: NextRequest) {
  try {

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

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("Couldn't connect to Database");
    }

    const deptId = session?.user.deptId


    const result = await pool.request()
      .input("FLAG", "GetDisposalGenerateListByDept")
      .input("DeptID", deptId)
      .execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json(result.recordset)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 },
    );
  }
}