import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import decrypt from "@/components/Decrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";
export async function POST(req: NextRequest) {
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
            throw new Error("Could not connect to Database");
        }

        const { ID } = await req.json();
        if (!ID) {
            return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
        }

        // const id1 = await decrypt(ID);

        const result = await pool
            .request()
            .input("FLAG", "GetActualDateofDisposalofWaste")
            .input("ID", sql.VarChar, ID)
            .execute("PRO-WMS_GET");

        // console.log(result);
        // const row = result.recordset

        // if (!row) {
        //     return NextResponse.json({ success: false, message: "No data found" });
        // }
        return NextResponse.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}