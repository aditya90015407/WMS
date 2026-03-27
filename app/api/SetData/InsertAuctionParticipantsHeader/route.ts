import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import decrypt from "@/components/Decrypt";

export async function POST(req: Request) {
    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Could not connect to Database");
        }

        const { Name, Email, EmpCode, IDDID, VID } = await req.json();

        if (!Name || !Email || !EmpCode || !IDDID || !VID) {
            return NextResponse.json(
                { success: false, message: "Name, Email, EmpCode, IDDID, VID are required" },
                { status: 400 }
            );
        }

        const realId = await decrypt(IDDID);
        const realVID = String(VID); // do NOT decrypt

        const result = await pool
            .request()
            .input("FLAG", sql.VarChar, "Insert-Auction-Participants-Header")
            .input("Name", sql.VarChar, Name)
            .input("Email", sql.VarChar, Email)
            .input("IDDID", sql.Int, Number(realId))
            .input("VID", sql.VarChar, realVID)
            .input("EmpCode", sql.VarChar, EmpCode)
            .execute("PRO-WMS_SET");

        const row = result.recordset?.[0];
        const status = row?.STATUS ?? "";
        const match = status.match(/Ref No\.\s*-(\d+)/);
        const apidFromStatus = match ? match[1] : undefined;
        console.log(apidFromStatus)
        return NextResponse.json({
            success: true,
            message: row?.STATUS ?? "Inserted successfully",
            data: {
                APID: row?.APID ?? apidFromStatus,
                STATUS: row?.status,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}

