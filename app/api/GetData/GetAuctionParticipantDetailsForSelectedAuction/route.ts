import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import * as sql from "mssql";
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
        const iddid = Number(body?.IDDID ?? 0);
        const vid = Number(body?.VID ?? 0);
        if (!iddid || !vid) {
            return NextResponse.json(
                { success: false, message: "Missing required field: IDDID & VID" },
                { status: 400 });

        }

        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Database Not Connected");
        }

        const result = await pool
            .request()
            .input("FLAG", sql.NVarChar, "GetAuctionParticipantDetailsForSelectedAuction")
            .input("IDDID", sql.Int, iddid)
            .input("VID", sql.Int, vid)
            .execute("PRO-WMS_GET");
        // console.log(result);

        return NextResponse.json({
            success: true,
            data: result.recordset ?? [],
        });

    }
    catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                message: err?.message || "Failed to fetch approval rejection history",
            },
            { status: 500 },
        );
    }
}
