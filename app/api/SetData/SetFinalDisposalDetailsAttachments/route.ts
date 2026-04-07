import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import { generateUniqueFileName } from "@/lib/filename";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Could not connect to Database");
        }

        const session = await getServerSession(authOptions);
        const empCode = String(session?.user?.id ?? "").trim();

        if (!empCode) {
            return NextResponse.json(
                { success: false, message: "Session not found" },
                { status: 401 },
            );
        }

        const form = await req.formData();
        console.log(form)
        const fddid = String(form.get("FDDID") ?? "").trim();

        if (!fddid) {
            return NextResponse.json(
                { success: false, message: "FDDID is required" },
                { status: 400 },
            );
        }

        const salePoSoDoc = form.get("salePoSoDoc") as File | null;

        if (!salePoSoDoc) {
            return NextResponse.json(
                { success: false, message: "salePoSoDoc is required" },
                { status: 400 },
            );
        }

        const salePoSoDocName = salePoSoDoc
            ? generateUniqueFileName(salePoSoDoc.name || "sale-poso")
            : "";

        const saveDir = "D:\\WMS UPDATE\\WMS-main\\Attachments";
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        const saveFile = async (file: File | null, fileName: string) => {
            if (!file || !fileName) return;
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(path.join(saveDir, fileName), buffer);
        };

        await saveFile(salePoSoDoc, salePoSoDocName);
        console.log({ fddid, salePoSoDocName })
        const res = await pool
            .request()
            .input("FLAG", sql.VarChar, "SetFinalDisposalDetailsAttachments")
            .input("FDDID", sql.Int, fddid)
            .input("AttachPath", sql.VarChar, salePoSoDocName)
            // .input("FinalPartyDoc", sql.VarChar, finalPartyDocName)
            // .input("EmpCode", sql.VarChar, empCode)
            .execute("PRO-WMS_SET");
        //  console.log(res);
        return NextResponse.json({
            success: true,
            message: "Disposal attachments saved successfully",

        });

    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 },
        );
    }
}
