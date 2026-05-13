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
                {
                    success: false,
                    message: "Session not found",
                },
                { status: 401 }
            );
        }

        const form = await req.formData();

        const fddid = String(form.get("FDDID") ?? "").trim();

        if (!fddid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "FDDID is required",
                },
                { status: 400 }
            );
        }

        const salePoSoDoc = form.get("salePoSoDoc") as File | null;
        const finalPartyDoc = form.get("finalPartyDoc") as File | null;
        const documentProof = form.get("documentProof") as File | null;

        const saveDir = path.join(process.cwd(), "Attachments");

        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        const saveFile = async (
            file: File | null,
            fileName: string
        ) => {
            if (!file || !fileName) return;

            const buffer = Buffer.from(await file.arrayBuffer());

            fs.writeFileSync(
                path.join(saveDir, fileName),
                buffer
            );
        };
        if (finalPartyDoc) {

            const finalPartyDocName =
                generateUniqueFileName(
                    finalPartyDoc.name || "final-party-doc"
                );

            await saveFile(finalPartyDoc, finalPartyDocName);

            await pool
                .request()
                .input("FLAG", sql.VarChar, "SetFinalDisposalDetailsAttachments")
                .input("FDDID", sql.Int, Number(fddid))
                .input("AttachPath", sql.VarChar, finalPartyDocName)
                .execute("PRO-WMS_SET");
        }

        if (documentProof) {
            const documentProofName =
                generateUniqueFileName(
                    documentProof.name || "doc-proof-name"
                )

            await saveFile(documentProof, documentProofName)

            await pool
                .request()
                .input("FLAG", sql.VarChar, "SetFinalDisposalDetailsAttachments")
                .input("FDDID", sql.Int, Number(fddid))
                .input("AttachPath", sql.VarChar, documentProofName)
                .execute("PRO-WMS_SET");

        }


        if (salePoSoDoc) {

            const salePoSoDocName =
                generateUniqueFileName(
                    salePoSoDoc.name || "sale-poso"
                );

            await saveFile(salePoSoDoc, salePoSoDocName);

            const size = salePoSoDoc.size;

            await pool
                .request()
                .input("FLAG", sql.VarChar, "SetFinalDisposalDetailsAttachments")
                .input("FDDID", sql.Int, Number(fddid))
                .input("AttachPath", sql.VarChar, salePoSoDocName)
                // .input("Size", sql.Int, size)
                .execute("PRO-WMS_SET");
        }

        return NextResponse.json({
            success: true,
            message: "Disposal attachments saved successfully",
        });

    } catch (err: any) {

        return NextResponse.json(
            {
                success: false,
                message: err?.message || "Server error",
            },
            { status: 500 }
        );
    }
}