import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json("Invalid Request")
    }

    var EmpCode = "", EmpName = ""
    if (session) {
      EmpCode = session?.user?.id || "";
      EmpName = session?.user?.username || "";
    }

    const body = await req.json();
    const id = String(body?.ID ?? "").trim();
    // console.log("GetForm10Details ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required field: ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("SQL pool is not connected after getConnection()");
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(50), "GetFinalDisposalDetails")
      .input("ID", sql.NVarChar(50), id)
      .execute("PRO-WMS_GET");

    const rows = Array.isArray(result.recordset) ? result.recordset[0] : [];
    // console.log(result, id)
    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    // console.error("GetForm10Details API failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "GetForm10Details API failed",
        error: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
