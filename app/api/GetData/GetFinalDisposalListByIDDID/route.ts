import { getConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";
export async function POST(req: Request) {
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
        const { id } = await req.json();
        // console.log(id)
        if (!pool || !pool.connected) {
            throw new Error("Db not connected");
        }
        if (!id) {
            return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
        }

        const result = await pool.request()
            .input("FLAG", sql.VarChar, "GetFinalDisposalListByIDDID")
            .input("ID", sql.VarChar, String(id))
            .execute("PRO-WMS_GET");
        // console.log(result.recordset)

        return NextResponse.json({
            success: true,
            data: result.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server Error" },
            { status: 500 }
        );
    }
}