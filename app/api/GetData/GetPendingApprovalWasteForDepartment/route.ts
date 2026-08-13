import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";

export async function POST(req: Request) {

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
    const body = await req.json();

    const DeptID = String(body?.DeptID ?? "").trim();
    const empCode = String(body?.EmpCode ?? "").trim();
    const uid = String(body?.UID ?? "").trim();


    // console.log(DeptID,empCode,uid);

    const result = await pool
      .request()
      .input("FLAG", NVarChar(50), "GetPendingApprovalWasteForDepartment")
      .input("DeptID", NVarChar(50), DeptID)
      .input("empCode", NVarChar(50), empCode)
      .input("uid", NVarChar(50), uid)
      .execute("PRO-WMS_GET");
    //  console.log(result)

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error",
      },
      { status: 500 },
    );
  }
}
