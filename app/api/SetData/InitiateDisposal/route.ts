import { NextResponse } from "next/server";
import * as sql from "mssql";
import { getConnection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    const pool = await getConnection();

    const empCode = String(session?.user?.id ?? "").trim();
    if (!empCode) {
      return NextResponse.json(
        { success: false, message: "Session not found. Please sign in again." },
        { status: 401 },
      );
    }

    if (!pool || !pool.connected) {
      throw new Error("DB Not Connected");
    }

    const wcid = String(body.WCID ?? "").trim();
    const wid = String(body.WID ?? "").trim();
    const totalQty = Number(body.TotalQty ?? 0);
    const MUID = body.MUID
    const auctionable = Number(body.Auctionable ?? 1);
    const auctionDate = String(body.AuctionDate ?? "").trim();
    const remarks = String(body.Remarks ?? "").trim();
    const physicalForm = String(body.PSID ?? "").trim();
    const disposedTo = String(body.AID ?? "").trim();

    console.log(body)

    const result = await pool
      .request()
      .input("FLAG", sql.NVarChar(50), "InitiateDisposal")
      .input("WCID", sql.NVarChar(50), wcid)
      .input("WID", sql.NVarChar(50), wid)
      .input("TotalQty", sql.Decimal(18, 3), totalQty)
      .input("MUID", sql.Int, MUID)
      .input("Auctionable", sql.Int, auctionable)
      .input("AuctionDate", sql.Date, auctionDate)
      .input("PSID", sql.NVarChar(30), physicalForm)
      .input("AID", sql.NVarChar(30), disposedTo)
      .input("Remarks", sql.NVarChar(sql.MAX), remarks)
      .input("EmpCode", sql.Int, Number(empCode))
      .execute("PRO-WMS_SET");
    // console.log(result.recordset)
    const status = String(result.recordset?.[0]?.STATUS ?? "");
    const match = status.match(/-\s*(\d+)/);
    const wrid = match?.[1] ? Number(match[1]) : null;

    return NextResponse.json({
      success: true,
      data: {
        recordset: result.recordset ?? [],
        WRID: wrid,
      },
    });


  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
