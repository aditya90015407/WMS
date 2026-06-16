import { getConnection } from "@/lib/dbConnect";
import { NVarChar } from "mssql";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const pool = await getConnection();
    const body = await req.json();

        const DeptID = String(body?.DeptID ?? "").trim();
        const empCode = String(body?.EmpCode ?? "").trim();
        const uid = String(body?.UID ?? "").trim();


    // console.log(DeptID,empCode,uid);

    const result=await pool
                .request()
                .input("FLAG",NVarChar(50),"GetPendingApprovalWasteForDepartment")
                .input("DeptID",NVarChar(50),DeptID)
                .input("empCode",NVarChar(50),empCode)
                .input("uid",NVarChar(50),uid)
                .execute("PRO-WMS_GET");
    //  console.log(result)

    return NextResponse.json({
      success: true,
      data : result.recordset,
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
