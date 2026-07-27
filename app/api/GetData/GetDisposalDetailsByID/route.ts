import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import decrypt from "@/components/Decrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
export async function POST(req: NextRequest) {
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

        const { id } = await req.json();
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Could not connect to Database");
        }

        if (!id) {
            return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
        }


        const result = await pool
            .request()
            .input("FLAG", "GetDisposalDetailsByID")
            .input("ID", sql.VarChar, id)
            .execute("PRO-WMS_GET");

        // console.log(result.recordset);
        // const row = result.recordset?.[0]

        // if (!row) {
        //     return NextResponse.json({ success: false, message: "No data found" });
        // }
        return NextResponse.json(result.recordset[0]);
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}