import { getConnection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import sql from "mssql";
import { generateUniqueFileName } from "@/lib/filename";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { signOut } from "next-auth/react";

export async function POST(req: Request) {
    try {
        const pool = await getConnection();
        if (!pool || !pool.connected) {
            throw new Error("Could not connect to Database");
        }

        const session = await getServerSession(authOptions);

        if (!session) {
            await signOut({ callbackUrl: '/', redirect: true })
            return NextResponse.json("Invalid Request")
        }

        const EmpCode = session?.user.id

        const form = await req.formData();

        // console.log(form)

        const WRID = String(form.get("WRID") || "");

        if (!WRID) {
            return NextResponse.json(
                { success: false, message: "WRID is required" },
                { status: 400 }
            );
        }

        const LabReport = form.get("AttachPath") as File | null;

        const AttachPath = generateUniqueFileName(LabReport?.name ?? "LabReport.pdf");

        const rootdir = process.cwd()
        const saveDir = `${rootdir}/Attachments`;
        // console.log(saveDir, "savedir")
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

        async function saveFile(file: File | null, fileName: string) {
            if (!file) return;
            const buffer = Buffer.from(await file.arrayBuffer());
            const filePath = path.join(saveDir, fileName);
            // console.log(filePath, "filepath")
            fs.writeFileSync(filePath, buffer);
        }

        await saveFile(LabReport, AttachPath);

        const result = await pool
            .request()
            .input("FLAG", "UploadLabReport")
            .input("WRID", WRID)
            .input("AttachPath", AttachPath)
            .input("EmpCode", EmpCode)
            .execute("PRO-WMS_SET");

        // console.log("rowsAffected:", result.rowsAffected);
        // console.log("recordset:", result.recordset);

        return NextResponse.json({ success: true, message: "Documents saved" });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}
