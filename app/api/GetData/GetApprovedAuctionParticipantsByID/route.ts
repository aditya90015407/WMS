import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import decrypt from "@/components/Decrypt";
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

    const pool = await getConnection();
    if (!pool || !pool.connected) {
      throw new Error("Could not connect to Database");
    }

    const { ID } = await req.json();

    // console.log(ID)
    if (!ID) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }


    // const realId = await decrypt(ID);

    const result = await pool
      .request()
      .input("FLAG", sql.VarChar, "GetApprovedAuctionParticipantsByID")
      .input("ID", sql.VarChar, ID)
      .execute("PRO-WMS_GET");

    // console.log(result.recordset)

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
