import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import * as sql from "mssql";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {

  const session = await getServerSession(authOptions);

  if (!session) {
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
      throw new Error("Database Not Connected")
    }

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar, "GetListOfAuctionWithVendorFinalised")
      .execute("PRO-WMS_GET");

    // console.log(result)
    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });

  }
  catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Failed to load Form 10 disposal list",
      },
      { status: 500 },
    );
  }
}